import { useState, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export default function AddToLog({ onSaved }) {
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const savedTimeoutRef = useRef(null);

  const saveToLog = async (e) => {
    e.preventDefault();
    if (!input.trim() || saving) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`${API_BASE}/api/append-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      setInput('');
      setSaved(true);
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSaved(false), 2000);
      onSaved?.();
    } catch (err) {
      console.error('Save to log error', err);
      const msg = err.message?.includes('Failed to fetch')
        ? 'Could not reach backend. Start it with: npm run server'
        : err.message || 'Save failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tab-content">
      <section className="section">
        <div className="section-header">
          <span className="section-line" />
          <h2 className="section-title">ADD TO LOG</h2>
        </div>
        <p className="section-desc">
          Paste a pre-formatted session entry (--- block with DATE:) and/or a key lifts table row
          (| DD.MM.YYYY | …). Saves immediately to GitHub at the correct position.
        </p>
      </section>

      <div className="coach-chat">
        <form className="coach-chat-input" onSubmit={saveToLog}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={'Paste session entry and/or table row here…\n\nExample session:\n---\nDATE: 12.06.2026\nSESSION: Lower Body II\n...\n---\n\nExample table row:\n| 12.06.2026 | 45kg×10 | — | ... | 7–8 |'}
            rows={16}
          />
          <div className="coach-chat-actions">
            {error && <div className="coach-chat-error">{error}</div>}
            {saved && !error && <div className="coach-chat-success">Saved to log</div>}
            <button type="submit" disabled={saving || !input.trim()}>
              {saving ? 'SAVING…' : saved ? 'SAVED' : 'SAVE TO LOG'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
