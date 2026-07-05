import { useState } from 'react';
import { useTrainingLog } from './hooks/useTrainingLog';
import LiftProgressionChart from './components/LiftProgressionChart';
import WeeklyVolumeChart from './components/WeeklyVolumeChart';
import CurrentLiftsTable from './components/CurrentLiftsTable';
import SurfSkateLog from './components/SurfSkateLog';
import SessionTimeline from './components/SessionTimeline';
import OuraTrend from './components/OuraTrend';
import CoachChat from './components/CoachChat';
import './styles.css';

const TABS = ['Overview', 'Lifts', 'Volume', 'Surf & Skate', 'Coach Chat'];

export default function App() {
  const { data, loading, error, lastFetched, refresh } = useTrainingLog();
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="athlete-tag">ATHLETE</div>
          <h1 className="athlete-name">NATALIA<span className="name-accent">.</span></h1>
          <div className="header-sub">Training Dashboard · Mar 2026</div>
        </div>
        <div className="header-right">
          <button className="refresh-btn" onClick={refresh} disabled={loading}>
            {loading ? '↻' : '↺'} {loading ? 'LOADING' : 'REFRESH'}
          </button>
          {lastFetched && (
            <div className="last-updated">
              Updated {lastFetched.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          ⚠ Could not fetch live log — showing demo data. <span>{error}</span>
        </div>
      )}

      <nav className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="content">
        {loading && !data ? (
          <div className="loading-screen">
            <div className="loading-bar" />
            <div className="loading-text">PARSING LOG DATA</div>
          </div>
        ) : data ? (
          <>
            {activeTab === 'Overview' && <OverviewTab data={data} />}
            {activeTab === 'Lifts' && <LiftsTab data={data} />}
            {activeTab === 'Volume' && <VolumeTab data={data} />}
            {activeTab === 'Surf & Skate' && <SurfTab data={data} />}
            {activeTab === 'Coach Chat' && <CoachChat />}
          </>
        ) : null}
      </main>
    </div>
  );
}

function OverviewTab({ data }) {
  const { currentLifts, recentSessions, ouraTrend, weeklyVolume, coachNotes } = data;

  // Quick stats over full history
  const totalStrength = weeklyVolume.reduce((a, w) => a + w.strength, 0);
  const totalCardio = weeklyVolume.reduce((a, w) => a + w.cardio, 0);
  const totalSurf = weeklyVolume.reduce((a, w) => a + (w.surf || 0) + (w.skate || 0), 0);
  const latestOura = ouraTrend.length ? ouraTrend[ouraTrend.length - 1].score : null;

  return (
    <div className="tab-content">
      {/* Stats row */}
      <div className="stats-row">
        <StatCard label="Oura Today" value={latestOura ?? '—'} unit="" accent={latestOura < 65 ? 'red' : latestOura >= 80 ? 'green' : 'yellow'} />
        <StatCard label="Strength" value={totalStrength} unit="sessions (all time)" />
        <StatCard label="Cardio" value={totalCardio} unit="sessions (all time)" />
        <StatCard label="Surf + Skate" value={totalSurf} unit="sessions (all time)" />
      </div>

      {/* Key lifts snapshot */}
      <Section title="CURRENT LIFTS">
        <CurrentLiftsTable lifts={currentLifts} compact />
      </Section>

      {/* Oura trend */}
      {ouraTrend.length > 0 && (
        <Section title="RECOVERY TREND (OURA)">
          <OuraTrend data={ouraTrend} />
        </Section>
      )}

      {/* Recent sessions */}
      <Section title="RECENT SESSIONS">
        <SessionTimeline sessions={recentSessions} />
      </Section>

      {/* Coach notes */}
      {coachNotes.length > 0 && (
        <Section title="COACH FLAGS">
          <div className="coach-notes">
            {coachNotes.map((note, i) => (
              <div key={i} className="coach-note">
                <span className="note-bullet">→</span> {note}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function LiftsTab({ data }) {
  const { liftsData, currentLifts } = data;
  const LIFTS = [
    { key: 'deadlift', label: 'Deadlift', target: '50kg', color: '#e63946' },
    { key: 'frontSquat', label: 'Front Squat', target: '30kg', color: '#f4a261' },
    { key: 'rdl', label: 'Romanian Deadlift', target: '45kg', color: '#2a9d8f' },
    { key: 'hipThrust', label: 'Hip Thrust', target: '40kg', color: '#e9c46a' },
    { key: 'slDL', label: 'SL Deadlift', target: '20kg', color: '#264653' },
    { key: 'bulgarianSS', label: 'Bulgarian Split Squat', target: '16kg', color: '#6a4c93' },
    { key: 'row', label: 'Seated Row', target: '35kg', color: '#1b7a8d' },
    { key: 'ohp', label: 'OH Press (DB)', target: '12kg', color: '#c77dff' },
    { key: 'pullups', label: 'Pull-ups', target: '3–5 strict', color: '#f72585', useReps: true },
  ];

  return (
    <div className="tab-content">
      <Section title="LIFT PROGRESSION — ALL TRACKED LIFTS">
        <p className="section-desc">
          Each chart shows progression from post-surgery baseline (weights in kg, except Pull-ups which tracks strict reps). Targets = 6–9 month return goals.
        </p>
        <div className="lifts-grid">
          {LIFTS.map(lift => (
            <LiftProgressionChart
              key={lift.key}
              label={lift.label}
              liftKey={lift.key}
              liftsData={liftsData}
              current={currentLifts[lift.key]}
              target={lift.target}
              color={lift.color}
              useReps={lift.useReps ?? false}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

function VolumeTab({ data }) {
  const { weeklyVolume, sessions } = data;
  return (
    <div className="tab-content">
      <Section title="WEEKLY SESSION VOLUME — FULL HISTORY">
        <WeeklyVolumeChart data={weeklyVolume} />
      </Section>
      <Section title="ALL SESSIONS">
        <SessionTimeline
          sessions={[...sessions]
            .filter(s => s.category !== 'rest')
            .sort((a, b) => b.date - a.date)}
          showAll
        />
      </Section>
    </div>
  );
}

function SurfTab({ data }) {
  const { surfSkateHistory, sessions } = data;
  const surfSessions = sessions.filter(s => s.category === 'surf' || s.category === 'skate');
  const total = surfSessions.length;
  const avgIntensity = surfSessions.filter(s => s.intensity).length;

  return (
    <div className="tab-content">
      <div className="stats-row">
        <StatCard label="Sessions (all)" value={total} unit="total" />
        <StatCard label="Surf" value={surfSessions.filter(s => s.category === 'surf').length} unit="sessions" />
        <StatCard label="Skate" value={surfSessions.filter(s => s.category === 'skate').length} unit="sessions" />
        <StatCard label="With flags" value={surfSessions.filter(s => s.hasFlags).length} unit="sessions" accent={surfSessions.filter(s => s.hasFlags).length > 0 ? 'yellow' : 'green'} />
      </div>
      <Section title="SURF & SKATE LOG">
        <SurfSkateLog sessions={surfSkateHistory} />
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="section">
      <div className="section-header">
        <span className="section-line" />
        <h2 className="section-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, unit, accent }) {
  return (
    <div className={`stat-card ${accent ? `stat-card--${accent}` : ''}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {unit && <div className="stat-unit">{unit}</div>}
    </div>
  );
}
