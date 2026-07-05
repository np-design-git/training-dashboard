import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { buildLiftProgression } from '../utils/parseLog';

// If useReps is true, chart reps instead of weight (e.g. for pull-ups)
export default function LiftProgressionChart({ label, liftKey, liftsData, current, target, color, tall, useReps = false }) {
  const data = buildLiftProgression(liftsData, liftKey);

  const currentDisplay = current
    ? current.bodyweight
      ? 'BW'
      : current.strict
      ? `${current.reps} strict`
      : `${current.weight}kg`
    : '—';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    const primaryValue = useReps ? d.reps : d.weight;
    return (
      <div style={{
        background: '#111',
        border: '1px solid #2a2a2a',
        padding: '8px 12px',
        fontFamily: 'Space Mono, monospace',
        fontSize: '11px',
      }}>
        <div style={{ color: '#666' }}>{d.date}</div>
        <div style={{ color, fontWeight: 700 }}>
          {useReps ? `${primaryValue} reps` : `${d.label} × ${d.reps}`}
        </div>
      </div>
    );
  };

  return (
    <div className="lift-card">
      <div className="lift-card-header">
        <div className="lift-card-title" style={{ color: 'var(--text)' }}>{label}</div>
        <div className="lift-card-meta">
          <div className="lift-current" style={{ color }}>{currentDisplay}</div>
          <div className="lift-target">target: {target}</div>
        </div>
      </div>

      <div className={tall ? 'lift-chart-wrap lift-chart-wrap--tall' : 'lift-chart-wrap'}>
        {data.length === 0 ? (
          <div className="no-data">NO DATA YET</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis
                dataKey="date"
                tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#444' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={d => d.slice(0, 5)}
              />
              <YAxis
                tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#444' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => (useReps ? v : `${v}kg`)}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={useReps ? 'reps' : 'weight'}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
