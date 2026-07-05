# Natalia · Training Dashboard

A personal athlete dashboard that auto-updates from your training log markdown file.

## Stack
- Vite + React
- Recharts (charts)
- Reads directly from your `training_log_active.md` file via GitHub

---

## Setup (5 minutes)

### Step 1 — Open in Cursor
1. Unzip the project folder
2. Open Cursor → `File` → `Open Folder` → select `natalia-dashboard`
3. Open the Cursor terminal (`Ctrl+\`` or `Cmd+\``)

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Run locally (demo mode)
```bash
npm run dev
```
Open `http://localhost:5173` — the dashboard runs immediately with your actual log data (pre-loaded as demo).

---

## Connect to your live training log (recommended)

### Step 4 — Create a GitHub repo
1. Go to [github.com](https://github.com) → New repository
2. Name it something like `training-log` → set to **Public** (simplest option)
3. Create the repo

### Step 5 — Upload your log file
1. In the repo, click `Add file` → `Upload files`
2. Upload your `training_log_active.md` file
3. Commit it

### Step 6 — Get the raw URL
1. Click on `training_log_active.md` in GitHub
2. Click the **Raw** button (top right of the file view)
3. Copy the URL from your browser address bar
   - It looks like: `https://raw.githubusercontent.com/natalia/training-log/main/training_log_active.md`

### Step 7 — Configure the app
1. Copy `.env.example` to `.env` in the project root:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and paste your raw URL:
   ```
   VITE_LOG_URL=https://raw.githubusercontent.com/YOUR_USERNAME/training-log/main/training_log_active.md
   ```
3. Restart the dev server (`Ctrl+C` then `npm run dev`)

Now the dashboard reads your live log! Every time Claude gives you a log entry and you paste it into the file and push to GitHub, the dashboard updates within seconds.

---

## Update workflow (what you do after each session)

1. Claude gives you the log entry (formatted markdown)
2. You paste it into `training_log_active.md`
3. In your GitHub repo: `Add file` → upload the updated file (or use GitHub Desktop / git push)
4. Click **Refresh** in the dashboard → data updates instantly

**Or use GitHub Desktop** (even simpler than the web interface):
- Download [GitHub Desktop](https://desktop.github.com)
- Clone your repo
- Edit the `.md` file locally → commit → push
- Dashboard refreshes automatically every 5 minutes anyway

---

## Deploy publicly (optional — access from phone/anywhere)

### Deploy to Vercel (free, 1 minute):
1. Push the project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Add environment variable: `VITE_LOG_URL` = your log URL
4. Deploy → get a URL like `natalia-dashboard.vercel.app`

---

## Private GitHub repos

If you want your log file in a private repo:
1. Create a GitHub Personal Access Token:
   - GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
   - Give it `Contents: Read` access to your repo
2. In `src/hooks/useTrainingLog.js`, update the fetch call:
   ```js
   const res = await fetch(url, {
     headers: {
       'Authorization': `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}`,
     }
   });
   ```
3. Add `VITE_GITHUB_TOKEN=your_token_here` to your `.env` file

---

## Dashboard features

| Tab | What you see |
|-----|-------------|
| **Overview** | Oura trend, current lifts snapshot, recent sessions, coach flags |
| **Lifts** | Progression chart for every tracked lift with 6–9mo targets |
| **Volume** | Weekly session volume (strength / cardio / surf) stacked bar |
| **Surf & Skate** | All surf and skate sessions with conditions and intensity |

---

## Log format requirements

The app parses your existing `training_log_active.md` format exactly. No changes needed to how Claude writes entries. The parser reads:
- `KEY LIFTS TABLE` section → current weights + progression charts
- `SESSION:` field → session type classification
- `OURA:` field → recovery trend
- `FLAGS:` field → flag highlighting
- `SESSION: Surf / Skate` → surf log

---

## Troubleshooting

**Dashboard shows demo data:** Check that `VITE_LOG_URL` is set correctly in `.env` and restart `npm run dev`.

**Charts are empty:** The key lifts table needs at least 2 entries with the same lift to show a line. One entry shows as a dot.

**CORS error in console:** Your GitHub URL must be a raw URL (`raw.githubusercontent.com`), not the regular GitHub page URL.
