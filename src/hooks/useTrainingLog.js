import { useState, useEffect, useCallback } from 'react';
import { parseTrainingLog } from '../utils/parseLog';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────
// Replace this URL with your own GitHub raw file URL after setting up the repo.
// Format: https://raw.githubusercontent.com/USERNAME/REPO/main/training_log_active.md
//
// How to get this URL:
// 1. Create a private GitHub repo (free)
// 2. Add your training_log_active.md file
// 3. Click the file → click "Raw" → copy the URL
// 4. Paste it below

const GITHUB_RAW_URL = import.meta.env.VITE_LOG_URL || '';

// Fallback: paste log content directly for local development
// Replace the empty string below with your log content for offline use
const LOCAL_LOG_FALLBACK = ``;

// ─────────────────────────────────────────────────────────────────────────────

export function useTrainingLog() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let markdown = '';

      if (GITHUB_RAW_URL) {
        // GitHub raw + browser caches can serve stale content; bust both aggressively.
        const sep = GITHUB_RAW_URL.includes('?') ? '&' : '?';
        const url = `${GITHUB_RAW_URL}${sep}cb=${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const res = await fetch(url, {
          cache: 'no-store',
          headers: { Accept: 'text/plain,text/markdown,*/*' },
        });
        if (!res.ok) throw new Error(`Failed to fetch log: ${res.status}`);
        markdown = await res.text();
      } else if (LOCAL_LOG_FALLBACK) {
        markdown = LOCAL_LOG_FALLBACK;
      } else {
        // Use demo data if nothing configured
        markdown = getDemoLog();
      }

      const parsed = parseTrainingLog(markdown);
      setData(parsed);
      setLastFetched(new Date());
    } catch (err) {
      setError(err.message);
      // Try to use demo data as fallback
      const parsed = parseTrainingLog(getDemoLog());
      setData(parsed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLog();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchLog, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLog]);

  return { data, loading, error, lastFetched, refresh: fetchLog };
}

// ─── DEMO DATA ────────────────────────────────────────────────────────────────
// Pre-loaded with Natalia's actual log data so the dashboard works immediately
function getDemoLog() {
  return `# ACTIVE TRAINING LOG — Natalia Patino Hansen
# Rolling 8-week window | Format v1.0
# Oldest entry in this file: 18.02.2026 | Current as of: 02.03.2026

---

## KEY LIFTS TABLE — STRENGTH SESSIONS ONLY
## Coach reads this first. Keep it current.

| Date | Deadlift | SL-DL | Front Squat | Bulgarian SS | RDL | Hip Thrust | OHP (DB) | Row | Pull-ups | RPE |
|------|----------|-------|-------------|--------------|-----|------------|----------|-----|----------|-----|
| 01.03.2026 | — | — | 23kg×12 | 8kg×12 | 35kg×10 | 25kg×14 | — | — | — | 7–8 |
| 23.02.2026 | — | — | — | — | — | — | 7.5kg×10 | 32.5kg×10 | 1 strict | 8 |
| 18.02.2026 | 30kg×12 | 12kg×12 | — | — | — | — | — | — | — | 7 |

---

## ENTRIES — NEWEST FIRST

---
DATE: 02.03.2026
TYPE: Rest day
OURA: 55 | CYCLE DAY: 29
ACTIVITY: Full rest

FLAGS: Active illness — elevated temperature, immune response confirmed
NOTES: No training. Mandatory rest. Next session pending Oura recovery above 65.
---

---
DATE: 01.03.2026
SESSION: Lower Body II
OURA: 68 | CYCLE DAY: 28
SURF/SKATE THIS WEEK SO FAR: 0

BLOCK 1
Front Squat: 15kg×10 (ramp), 20kg×12 (ramp), 23kg×12, 23kg×12, 23kg×12 — miniband, solid
Split Lunges: 3×20 @ BW

BLOCK 2
Bulgarian Split Squat: 3×12 @ 8kg — stable knee tracking
Box Jump Rotation (20"): 3×8 @ BW — explosive, clean landing

BLOCK 3
RDL: 20kg×10 (ramp), 25kg×8 (ramp), 30kg×10 (ramp), 35kg×10, 35kg×10
Hip Thrust: 20kg×14, 25kg×14, 25kg×14, 25kg×14

CORE BLOCK
Side Plank L/R: 3×45s each

RPE: 7–8
DURATION: 65 min
FLAGS: none
NOTES: Front squat 3×12 confirmed at 23kg — ready for 25kg next session.
---

---
DATE: 25.02.2026
SESSION: Interval Bike
OURA: 78 | CYCLE DAY: 24

TYPE: Structured Intervals
DURATION: 1:16:00
AVG HR: 149 bpm | PEAK HR: 172 bpm

ZONE SPLIT:
Z2: 6min | Z3: 17min | Z4: 33min | Z5: 14min

INTERVAL DETAIL:
4×8min @ 150→168 bpm, 3min recovery (~135 bpm)

ACTIVE CALORIES: 391 kcal
RPE: 8
FLAGS: none
NOTES: Strong session. Z5 time increased vs last interval session.
---

---
DATE: 23.02.2026
SESSION: Upper Body
OURA: 76 | CYCLE DAY: 22

BLOCK 1
Seated Cable Row: 1×10 @ 30kg, 3×10 @ 32.5kg
Push-ups: 4×10 @ BW strict

BLOCK 2
Assisted Pull-ups (medium band): 4×4
Strict Pull-up: 1×1 @ BW — FIRST STRICT REP ACHIEVED
One-Arm OHP: 3×14 @ 5kg, 1×10 @ 7.5kg (trial)

CORE BLOCK
Plank: 3×45s
Side Plank L/R: 3×45s each

RPE: 8
DURATION: 60 min
FLAGS: OHP at 7.5kg challenging but stable trunk throughout
NOTES: Pull-up milestone.
---

---
DATE: 20.02.2026
SESSION: Surf
OURA: 72 | CYCLE DAY: 19

DURATION: 2h
CONDITIONS: overhead, solid
INTENSITY: moderate
POP-UP QUALITY: good

FLAGS: none
NOTES: Great session. Felt strong in the water.
---

---
DATE: 18.02.2026
SESSION: Lower Body I
OURA: 74 | CYCLE DAY: 17
SURF/SKATE THIS WEEK SO FAR: 1

BLOCK 1
Deadlift: 3×12 @ 30kg
Squat Jumps (rotation): 3×8 @ BW

BLOCK 2
Single-Leg Deadlift: 3×12 @ 12kg
Burpee Box Jumps: 3×8 @ BW

CORE BLOCK
Back Extensions: 3×60s @ BW
Hanging Leg Raise: 3×8 @ BW

RPE: 7
DURATION: 65 min
FLAGS: grip failure on HLR, hip tracking slightly off on SL-DL set 3
NOTES: SL-DL ready to increase next session.
---

---
DATE: 15.02.2026
SESSION: Surf
OURA: 80 | CYCLE DAY: 14

DURATION: 2.5h
CONDITIONS: waist-chest high
INTENSITY: moderate
POP-UP QUALITY: strong

FLAGS: none
NOTES: Best surf session in weeks. Legs felt great.
---

---
DATE: 12.02.2026
SESSION: Long Steady Bike
OURA: 75 | CYCLE DAY: 11

TYPE: Steady Z3
DURATION: 75 min
AVG HR: 139 bpm | PEAK HR: 152 bpm

ACTIVE CALORIES: 340 kcal
RPE: 6
FLAGS: none
NOTES: Solid aerobic base session.
---

---
DATE: 10.02.2026
SESSION: Surf
OURA: 77 | CYCLE DAY: 9

DURATION: 1.5h
CONDITIONS: small, fun
INTENSITY: easy
POP-UP QUALITY: good

FLAGS: none
NOTES: Easy session, focused on technique.
---

## NOTES FOR COACH
- 02.03.2026: Sick — rest day. Oura 55. Active immune response confirmed. No training.
`;
}
