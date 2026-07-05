import { LIFT_CONFIG } from '../config/lifts';

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
        {LIFT_CONFIG.map(({ key, label, target }) => {
          const lift = lifts[key];
          const weight = lift
            ? lift.bodyweight
              ? 'BW'
              : lift.strict
              ? `${lift.reps} strict`
              : `${lift.weight} kg`
            : null;
          const reps = lift && !lift.bodyweight && !lift.strict && !lift.approximate && lift.reps
            ? `× ${lift.reps}`
            : '';

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
