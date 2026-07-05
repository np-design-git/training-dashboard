import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load backend-only env (Claude/API keys, log URL, etc.)
dotenv.config({ path: './.backend.env' });

const app = express();
const PORT = process.env.PORT || 8787;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const LOG_URL = process.env.LOG_URL;

// Helper to read config files safely
const CONFIG_DIR = path.join(process.cwd(), 'coach-config');
function readConfigFile(filename) {
  try {
    const fullPath = path.join(CONFIG_DIR, filename);
    return fs.readFileSync(fullPath, 'utf8');
  } catch (err) {
    console.warn(`Could not read config file ${filename}:`, err.message);
    return '';
  }
}

// Load static config docs once at startup
const SYSTEM_PROMPT = readConfigFile('system-prompt.md');
const ATHLETE_PROFILE = readConfigFile('athlete-profile.md');
const TRAINING_LOG_TEMPLATE = readConfigFile('training-log-template.md');
const NUTRITION_PLAN = readConfigFile('nutrition-plan.md');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Simple health check
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    hasApiKey: Boolean(ANTHROPIC_API_KEY),
    hasSystemPrompt: Boolean(SYSTEM_PROMPT.trim()),
  });
});

// Helper: call Anthropic Messages API
async function callClaude(messagesFromClient) {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  // Fetch current active training log markdown
  let activeLog = '';
  if (LOG_URL) {
    try {
      const res = await fetch(`${LOG_URL}?t=${Date.now()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch log: ${res.status}`);
      }
      activeLog = await res.text();
    } catch (err) {
      console.warn('Could not fetch active training log:', err.message);
    }
  }

  // Build context message that bundles your docs + active log
  const contextTextParts = [];
  if (ATHLETE_PROFILE.trim()) {
    contextTextParts.push('Athlete profile:\n\n' + ATHLETE_PROFILE);
  }
  if (TRAINING_LOG_TEMPLATE.trim()) {
    contextTextParts.push('\n\nTraining log template:\n\n' + TRAINING_LOG_TEMPLATE);
  }
  if (NUTRITION_PLAN.trim()) {
    contextTextParts.push('\n\nNutrition plan and supplements:\n\n' + NUTRITION_PLAN);
  }
  if (activeLog) {
    contextTextParts.push('\n\nActive training log (markdown):\n\n' + activeLog);
  }

  const contextMessage = {
    role: 'user',
    content: [
      {
        type: 'text',
        text: contextTextParts.join('\n\n'),
      },
    ],
  };

  // Map frontend messages into Claude format
  const chatMessages = (Array.isArray(messagesFromClient) ? messagesFromClient : []).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: [{ type: 'text', text: m.content ?? '' }],
  }));

  const body = {
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 800,
    system: SYSTEM_PROMPT || 'You are a training coach for Natalia. Follow the attached documents and logs.',
    messages: [contextMessage, ...chatMessages],
  };

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const contentBlocks = data.content || [];
  const firstTextBlock = contentBlocks.find(b => b.type === 'text');
  const replyText = firstTextBlock?.text || '(no text in Claude response)';

  return replyText;
}

// Coach chat endpoint: proxy to Claude with your config + log
app.post('/api/coach-chat', async (req, res) => {
  try {
    const { messages } = req.body || {};
    const reply = await callClaude(messages);
    res.json({ reply });
  } catch (err) {
    console.error('Coach chat error:', err);
    res.status(500).json({ error: 'Coach backend error: ' + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local coach backend listening on http://localhost:${PORT}`);
});

