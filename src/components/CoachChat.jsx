import { useState } from 'react';

// Assumption: backend runs on this local port (server.js)
const API_BASE = 'http://localhost:8787';

export default function CoachChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newUserMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/coach-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const reply = data.reply || '(no reply from coach)';

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Coach chat error', err);
      setError('Could not reach local coach backend. Is `npm run server` running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <section className="section">
        <div className="section-header">
          <span className="section-line" />
          <h2 className="section-title">COACH CHAT — LOCAL STUB</h2>
        </div>
        <p className="section-desc">
          This is a local test chat wired to your backend stub. Messages are not persisted and no real Claude calls
          happen yet.
        </p>
      </section>

      <div className="coach-chat">
        <div className="coach-chat-messages">
          {messages.length === 0 && (
            <div className="coach-chat-empty">
              Type a message below to start a conversation with the local stub.
            </div>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`coach-chat-bubble coach-chat-bubble--${m.role === 'user' ? 'user' : 'assistant'}`}
            >
              <div className="coach-chat-meta">
                {m.role === 'user' ? 'YOU' : 'COACH'}
              </div>
              <div className="coach-chat-text">{m.content}</div>
            </div>
          ))}
        </div>

        <form className="coach-chat-input" onSubmit={sendMessage}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your coach something about your training..."
            rows={3}
          />
          <div className="coach-chat-actions">
            {error && <div className="coach-chat-error">{error}</div>}
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? 'SENDING…' : 'SEND'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

