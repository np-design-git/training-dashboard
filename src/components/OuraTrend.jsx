import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = d.score < 65 ? '#e63946' : d.score >= 80 ? '#2a9d8f' : '#e9c46a';
  return (
    <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: '8px 12px', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>
      <div style={{ color: '#666' }}>{d.date}</div>
      <div style={{ color, fontWeight: 700 }}>Score: {d.score}</div>
      <div style={{ color: '#555', marginTop: 2 }}>{d.category}</div>
    </div>
  );
};

function getDotColor(score) {
  if (score < 65) return '#e63946';
  if (score >= 80) return '#2a9d8f';
  return '#e9c46a';
}

export default function OuraTrend({ data }) {
  return (
    <div className="oura-wrap">
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#444' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={d => d.slice(0, 5)}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#444' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={65} stroke="#e63946" strokeDasharray="3 3" strokeWidth={1} />
          <ReferenceLine y={80} stroke="#2a9d8f" strokeDasharray="3 3" strokeWidth={1} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#888"
            strokeWidth={1.5}
            dot={(props) => {
              const { cx, cy, payload } = props;
              return (
                <circle
                  key={payload.date}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={getDotColor(payload.score)}
                  stroke="none"
                />
              );
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingLeft: 4 }}>
        {[{ label: '< 65 TRAIN LIGHT / REST', color: '#e63946' }, { label: '65–79 NORMAL', color: '#e9c46a' }, { label: '≥ 80 PUSH', color: '#2a9d8f' }].map(({ label, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#555' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
