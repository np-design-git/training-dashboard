export default function SurfSkateLog({ sessions }) {
  if (!sessions.length) {
    return (
      <div className="surf-log">
        <div className="surf-empty">NO SURF OR SKATE SESSIONS LOGGED</div>
      </div>
    );
  }

  const sorted = [...sessions].sort((a, b) => b.dateObj - a.dateObj);

  return (
    <div className="surf-log">
      <div className="surf-row surf-row-header">
        <span>Date</span>
        <span>Type</span>
        <span>Conditions</span>
        <span>Intensity</span>
      </div>
      {sorted.map((s, i) => (
        <div key={i} className="surf-row">
          <span className="surf-date">{s.date}</span>
          <span className={`surf-type ${s.type}`}>{s.type.toUpperCase()}</span>
          <span className="surf-conditions">
            {s.duration && <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>{s.duration}</span>}
            {s.conditions || '—'}
            {s.type === 'surf' && s.conditions && (
              <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-dim)' }}>
                {/* wave emoji as text */}
                〰
              </span>
            )}
          </span>
          <span className={`surf-intensity intensity-${s.intensity?.toLowerCase() || 'moderate'}`}>
            {s.intensity ? s.intensity.toUpperCase() : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}
