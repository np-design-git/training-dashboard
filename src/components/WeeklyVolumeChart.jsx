import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

const COLORS = {
  strength: '#e63946',
  cardio: '#2a9d8f',
  surf: '#f4a261',
  skate: '#c77dff',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111',
      border: '1px solid #2a2a2a',
      padding: '10px 14px',
      fontFamily: 'Space Mono, monospace',
      fontSize: '11px',
    }}>
      <div style={{ color: '#888', marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: COLORS[p.name] || '#888', marginBottom: 2 }}>
          {p.name.toUpperCase()}: {p.value} session{p.value !== 1 ? 's' : ''}
        </div>
      ))}
    </div>
  );
};

export default function WeeklyVolumeChart({ data }) {
  return (
    <div className="volume-wrap">
      <div className="volume-legend">
        {Object.entries(COLORS).map(([key, color]) => (
          <div key={key} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
          <XAxis
            dataKey="weekLabel"
            tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#444' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontFamily: 'Space Mono', fontSize: 9, fill: '#444' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="strength"
            stackId="sessions"
            fill={COLORS.strength}
            radius={[1, 1, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="cardio"
            stackId="sessions"
            fill={COLORS.cardio}
            radius={[1, 1, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="surf"
            stackId="sessions"
            fill={COLORS.surf}
            radius={[1, 1, 0, 0]}
            maxBarSize={24}
          />
          <Bar
            dataKey="skate"
            stackId="sessions"
            fill={COLORS.skate}
            radius={[1, 1, 0, 0]}
            maxBarSize={24}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
