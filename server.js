import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { parsePastedLog, appendToLog } from './src/utils/appendLog.js';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: './.backend.env' });
}

const app = express();
const PORT = process.env.PORT || 8787;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || 'training_log_active.md';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://np-design-git.github.io',
];

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

function githubHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

async function fetchFileFromGitHub() {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`;
  const res = await fetch(url, { headers: githubHeaders() });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub fetch failed (${res.status}): ${err}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf8');
  return { content, sha: data.sha };
}

async function commitFileToGitHub(content, sha, message) {
  const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { ...githubHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf8').toString('base64'),
      sha,
      branch: GITHUB_BRANCH,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub commit failed (${res.status}): ${err}`);
  }
  return res.json();
}

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    hasGitHubToken: Boolean(GITHUB_TOKEN),
    hasGitHubRepo: Boolean(GITHUB_REPO),
  });
});

app.post('/api/append-log', async (req, res) => {
  try {
    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return res.status(500).json({ error: 'GITHUB_TOKEN and GITHUB_REPO must be set' });
    }

    const { text } = req.body || {};
    if (!text?.trim()) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const parsed = parsePastedLog(text);
    const { content, sha } = await fetchFileFromGitHub();
    const updated = appendToLog(content, parsed);
    await commitFileToGitHub(updated, sha, 'Add training log entry via dashboard');

    res.json({
      ok: true,
      inserted: {
        tableRows: parsed.tableRows.length,
        sessionBlocks: parsed.sessionBlocks.length,
      },
    });
  } catch (err) {
    console.error('Append log error:', err);
    res.status(err.message.includes('detected') || err.message.includes('Nothing') ? 400 : 500).json({
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Log backend listening on http://localhost:${PORT}`);
});
