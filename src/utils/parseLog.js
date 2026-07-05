/**
 * Parser for Natalia's training log markdown format
 * Reads training_log_active.md and extracts structured data
 */

// Parse DD.MM.YYYY date string to JS Date
export function parseDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('.');
  if (!d || !m || !y) return null;
  return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
}

// Format date to DD.MM.YYYY
export function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

// Parse weight string like "30kg×12" or "3×12 @ 30kg" into { weight, reps }
export function parseWeightReps(str) {
  if (!str || str === '—' || str === '-') return null;
  // Format: "30kg×12" (from key lifts table)
  let m = str.match(/(\d+(?:\.\d+)?)kg[×x](\d+)/);
  if (m) return { weight: parseFloat(m[1]), reps: parseInt(m[2]) };
  // Format: "BW×12" 
  m = str.match(/BW[×x](\d+)/);
  if (m) return { weight: 0, reps: parseInt(m[1]), bodyweight: true };
  // Format: "1 strict" (pull-ups)
  m = str.match(/^(\d+)\s*strict/i);
  if (m) return { weight: 0, reps: parseInt(m[1]), strict: true };
  // Format: "40kg (12-10-12, uneven)" — weight only
  m = str.match(/(\d+(?:\.\d+)?)kg/);
  if (m) return { weight: parseFloat(m[1]), reps: 0, approximate: true };
  return null;
}

// Parse the KEY LIFTS TABLE section from the markdown
export function parseKeyLiftsTable(markdown) {
  const rows = [];
  const tableSection = markdown.match(/## KEY LIFTS TABLE[\s\S]*?(?=\n---\n\n##|\n## ENTRIES|$)/);
  if (!tableSection) return rows;

  const lines = tableSection[0].split('\n');
  // Find header row to get column order
  const headerLine = lines.find(l => l.includes('| Date |'));
  if (!headerLine) return rows;

  const headers = headerLine.split('|').map(h => h.trim()).filter(Boolean);

  // Map header labels to internal keys, supporting both old and new names
  const headerMap = {
    Deadlift: 'deadlift',
    'SL-DL': 'slDL',
    'SL Deadlift': 'slDL',
    'Front Squat': 'frontSquat',
    'Bulgarian SS': 'bulgarianSS',
    'Bulgarian Split Squat': 'bulgarianSS',
    RDL: 'rdl',
    'Romanian Deadlift': 'rdl',
    'Hip Thrust': 'hipThrust',
    'OHP (DB)': 'ohp',
    'OH Press (DB)': 'ohp',
    Row: 'row',
    'Seated Row': 'row',
    'Cable Row': 'row',
    'Lat Pull': 'latPull',
    'DB Bent Row': 'dbBentRow',
    'Pull-ups': 'pullups',
  };

  for (const line of lines) {
    if (!line.startsWith('|') || line.includes('---') || line === headerLine) continue;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 2) continue;
    if (cells[0] === 'Date') continue;

    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || '—'; });
    const date = parseDate(row['Date']);
    if (!date) continue;

    const parsedRow = {
      date,
      dateStr: row['Date'],
      deadlift: null,
      slDL: null,
      frontSquat: null,
      bulgarianSS: null,
      rdl: null,
      hipThrust: null,
      ohp: null,
      latPull: null,
      row: null,
      dbBentRow: null,
      pullups: null,
      rpe: row['RPE'],
    };

    // Assign lift values using headerMap so both old and new names work
    for (const [headerLabel, internalKey] of Object.entries(headerMap)) {
      if (row[headerLabel] !== undefined) {
        parsedRow[internalKey] = parseWeightReps(row[headerLabel]);
      }
    }

    rows.push({
      ...parsedRow,
    });
  }

  return rows.sort((a, b) => a.date - b.date);
}

// Parse individual session entries
export function parseSessions(markdown) {
  const sessions = [];
  // Split on entry separators
  const entriesSection = markdown.match(/## ENTRIES[\s\S]*/);
  if (!entriesSection) return sessions;

  // Entries are separated by `---` blocks, but the first entry may begin immediately
  // after the "## ENTRIES" header without a leading separator.
  const entryBlocks = entriesSection[0].split(/\n---\n/);

  for (const block of entryBlocks) {
    if (!block.trim()) continue;

    const dateMatch = block.match(/^DATE:\s*(\d{2}\.\d{2}\.\d{4})/m);
    const sessionMatch = block.match(/^SESSION:\s*(.+)/m);
    const typeMatch = block.match(/^TYPE:\s*(.+)/m);
    const ouraMatch = block.match(/OURA:\s*(\d+|not recorded)/i);
    const cycleDayMatch = block.match(/CYCLE DAY:\s*(\d+|unknown)/i);
    const rpeMatch = block.match(/^RPE:\s*(.+)/m);
    const durationMatch = block.match(/^DURATION:\s*(.+)/m);
    const flagsMatch = block.match(/^FLAGS:\s*(.+)/m);
    const surfMatch = block.match(/SURF\/SKATE THIS WEEK SO FAR:\s*(\d+|[\d+]+)/i);
    const avgHrMatch = block.match(/AVG HR:\s*(\d+)/i);
    const peakHrMatch = block.match(/PEAK HR:\s*(\d+)/i);
    const conditionsMatch = block.match(/CONDITIONS:\s*(.+)/i);
    const intensityMatch = block.match(/INTENSITY:\s*(.+)/i);

    if (!dateMatch) continue;

    const date = parseDate(dateMatch[1]);
    if (!date) continue;

    const sessionType = sessionMatch?.[1]?.trim() || typeMatch?.[1]?.trim() || 'Rest day';

    // Classify session
    let category = 'other';
    const st = sessionType.toLowerCase();
    if (st.includes('lower body')) category = 'strength';
    else if (st.includes('upper body')) category = 'strength';
    else if (st.includes('bike') || st.includes('cardio') || st.includes('row') || st.includes('run') || st.includes('swim') || st.includes('interval')) category = 'cardio';
    else if (st.includes('surf')) category = 'surf';
    else if (st.includes('skate')) category = 'skate';
    else if (st.includes('rest')) category = 'rest';

    const flags = flagsMatch?.[1]?.trim() || 'none';
    const hasFlags = flags.toLowerCase() !== 'none' && flags !== '';

    sessions.push({
      date,
      dateStr: dateMatch[1],
      sessionType,
      category,
      oura: ouraMatch ? (ouraMatch[1] === 'not recorded' ? null : parseInt(ouraMatch[1])) : null,
      cycleDay: cycleDayMatch ? (cycleDayMatch[1] === 'unknown' ? null : parseInt(cycleDayMatch[1])) : null,
      rpe: rpeMatch?.[1]?.trim() || null,
      duration: durationMatch?.[1]?.trim() || null,
      flags,
      hasFlags,
      surfSkateCount: surfMatch ? parseInt(surfMatch[1]) : 0,
      avgHr: avgHrMatch ? parseInt(avgHrMatch[1]) : null,
      peakHr: peakHrMatch ? parseInt(peakHrMatch[1]) : null,
      conditions: conditionsMatch?.[1]?.trim() || null,
      intensity: intensityMatch?.[1]?.trim() || null,
      raw: block.trim(),
    });
  }

  return sessions.sort((a, b) => a.date - b.date);
}

// Build progression data for a specific lift from key lifts table
export function buildLiftProgression(liftsData, liftKey) {
  return liftsData
    .filter(row => row[liftKey] !== null)
    .map(row => ({
      date: row.dateStr,
      dateObj: row.date,
      weight: row[liftKey]?.weight ?? 0,
      reps: row[liftKey]?.reps ?? 0,
      label: row[liftKey]?.bodyweight ? 'BW' : row[liftKey]?.strict ? `${row[liftKey].reps} strict` : `${row[liftKey]?.weight}kg`,
    }));
}

// Get current (latest) weight for each lift
export function getCurrentLifts(liftsData) {
  const lifts = {
    deadlift: null, slDL: null, frontSquat: null, bulgarianSS: null,
    rdl: null, hipThrust: null, ohp: null, latPull: null, row: null,
    dbBentRow: null, pullups: null,
  };

  // Go through sorted data (oldest first) and overwrite with latest non-null
  for (const row of liftsData) {
    for (const key of Object.keys(lifts)) {
      if (row[key] !== null && row[key] !== undefined) {
        lifts[key] = { ...row[key], date: row.dateStr };
      }
    }
  }
  return lifts;
}

// Get weekly session counts across full history (from first to last session)
export function getWeeklyVolume(sessions) {
  if (!sessions.length) return [];

  // Determine overall date range
  const sortedByDate = [...sessions].sort((a, b) => a.date - b.date);
  const firstDate = sortedByDate[0].date;
  const lastDate = sortedByDate[sortedByDate.length - 1].date;

  // Align to week boundaries (Monday–Sunday)
  const daysToMonday = (d) => (d.getDay() + 6) % 7;
  const firstWeekStart = new Date(firstDate);
  firstWeekStart.setDate(firstWeekStart.getDate() - daysToMonday(firstWeekStart));
  firstWeekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(lastDate);
  lastWeekStart.setDate(lastWeekStart.getDate() - daysToMonday(lastWeekStart));
  lastWeekStart.setHours(0, 0, 0, 0);

  const lastWeekEnd = new Date(lastWeekStart);
  lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
  lastWeekEnd.setHours(23, 59, 59, 999);

  const result = [];

  for (
    let weekStart = new Date(firstWeekStart);
    weekStart <= lastWeekEnd;
    weekStart.setDate(weekStart.getDate() + 7)
  ) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekSessions = sessions.filter(s => s.date >= weekStart && s.date <= weekEnd);

    const strengthCount = weekSessions.filter(s => s.category === 'strength').length;
    const cardioCount = weekSessions.filter(s => s.category === 'cardio').length;
    const surfCount = weekSessions.filter(s => s.category === 'surf').length;
    const skateCount = weekSessions.filter(s => s.category === 'skate').length;

    result.push({
      weekLabel: `W${formatDate(weekStart).slice(0, 5)}`,
      weekStart: formatDate(weekStart),
      strength: strengthCount,
      cardio: cardioCount,
      surf: surfCount,
      skate: skateCount,
      rest: weekSessions.filter(s => s.category === 'rest').length,
      total: weekSessions.filter(s => s.category !== 'rest').length,
      sessions: weekSessions,
    });
  }

  return result;
}

// Get surf/skate session history
export function getSurfSkateHistory(sessions) {
  return sessions
    .filter(s => s.category === 'surf' || s.category === 'skate')
    .map(s => ({
      date: s.dateStr,
      dateObj: s.date,
      type: s.category,
      duration: s.duration,
      conditions: s.conditions,
      intensity: s.intensity,
      flags: s.flags,
    }))
    .sort((a, b) => a.dateObj - b.dateObj);
}

// Parse the NOTES FOR COACH section
export function parseCoachNotes(markdown) {
  const notesSection = markdown.match(/## NOTES FOR COACH\n([\s\S]*?)(?:\n---\n\n##|$)/);
  if (!notesSection) return [];
  return notesSection[1]
    .split('\n')
    .map(l => l.replace(/^-\s*/, '').trim())
    .filter(Boolean);
}

// Main parse function — call with the full markdown string
export function parseTrainingLog(markdown) {
  const liftsData = parseKeyLiftsTable(markdown);
  const sessions = parseSessions(markdown);
  const currentLifts = getCurrentLifts(liftsData);
  const weeklyVolume = getWeeklyVolume(sessions);
  const surfSkateHistory = getSurfSkateHistory(sessions);
  const coachNotes = parseCoachNotes(markdown);

  // Last 5 sessions (excluding rest days) for recent activity
  const recentSessions = [...sessions]
    .filter(s => s.category !== 'rest')
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  // Oura trend from last 14 sessions
  const ouraTrend = sessions
    .filter(s => s.oura !== null)
    .sort((a, b) => a.date - b.date)
    .slice(-14)
    .map(s => ({ date: s.dateStr, score: s.oura, category: s.category }));

  return {
    liftsData,
    sessions,
    currentLifts,
    weeklyVolume,
    surfSkateHistory,
    coachNotes,
    recentSessions,
    ouraTrend,
  };
}
