export default function SessionTimeline({ sessions, showAll }) {
  if (!sessions.length) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--text-dim)' }}>
        NO SESSIONS LOGGED
      </div>
    );
  }

  return (
    <div className="timeline">
      {sessions.map((s, i) => (
        <div key={i} className="timeline-item">
          <div className="timeline-date">{s.dateStr}</div>
          <div className="timeline-dot-col">
            <div className={`timeline-dot dot-${s.category}`} />
          </div>
          <div className="timeline-body">
            <div className="timeline-session">{s.sessionType}</div>
            <div className="timeline-details">
              {s.oura && (
                <span className="timeline-pill">OURA {s.oura}</span>
              )}
              {s.rpe && (
                <span className="timeline-pill">RPE {s.rpe}</span>
              )}
              {s.duration && s.duration !== 'not tracked' && (
                <span className="timeline-pill">{s.duration}</span>
              )}
              {s.avgHr && (
                <span className="timeline-pill">∅ {s.avgHr} bpm</span>
              )}
              {s.hasFlags && (
                <span className="timeline-pill timeline-pill--flag">⚑ {s.flags.split('—')[0].trim()}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
