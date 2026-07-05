const LIFT_DEFS = [
  { key: 'deadlift', label: 'Deadlift', target: '50 kg' },
  { key: 'slDL', label: 'SL Deadlift', target: '20 kg' },
  { key: 'frontSquat', label: 'Front Squat', target: '30 kg' },
  { key: 'bulgarianSS', label: 'Bulgarian Split Squat', target: '16 kg' },
  { key: 'rdl', label: 'Romanian Deadlift', target: '45 kg' },
  { key: 'hipThrust', label: 'Hip Thrust', target: '40 kg' },
  { key: 'row', label: 'Seated Row', target: '35 kg' },
  { key: 'ohp', label: 'OH Press (DB)', target: '12 kg' },
  { key: 'pullups', label: 'Pull-ups', target: '3–5 strict' },
];

export default function CurrentLiftsTable({ lifts, compact }) {
  return (
    <table className="lifts-table">
      <thead>
        <tr>
          <th>Exercise</th>
          <th>Current</th>
          {!compact && <th>Reps</th>}
          <th>Target</th>
          <th>Last logged</th>
        </tr>
      </thead>
      <tbody>
        {LIFT_DEFS.map(({ key, label, target }) => {
          const lift = lifts[key];
          const weight = lift
            ? lift.bodyweight
              ? 'BW'
              : lift.strict
              ? `${lift.reps} strict`
              : `${lift.weight} kg`
            : null;
          const reps = lift && !lift.bodyweight && !lift.strict ? `× ${lift.reps}` : '';

          return (
            <tr key={key}>
              <td><span className="lift-name">{label}</span></td>
              <td>
                {weight
                  ? <span className="lift-weight">{weight}</span>
                  : <span className="no-lift">—</span>
                }
              </td>
              {!compact && <td style={{ fontFamily: 'Space Mono, monospace', fontSize: 13 }}>{reps || '—'}</td>}
              <td style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>{target}</td>
              <td className="lift-date-cell">{lift?.date ?? '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
