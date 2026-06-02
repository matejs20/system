# SYSTEM — RPG Task Tracker

A gamified daily task tracker built with vanilla JavaScript, HTML and CSS — no frameworks.

Complete real-life tasks to earn XP, level up, climb the ranks and maintain your daily streak.

🔗 **Live demo:** [your-username.github.io/system](https://your-username.github.io/system)

---

## Features

- **Onboarding** — create a player profile and choose your task categories
- **Daily quests** — add tasks with difficulty (easy / medium / hard) and earn XP on completion
- **XP & leveling** — every 500 XP advances your level; animated level-up overlay on achievement
- **Rank system** — progress from E-RANK to S-RANK based on total XP earned
- **Streak tracking** — maintain a daily activity streak with visual flame indicator
- **Calendar view** — browse past days and review completed tasks
- **Stats page** — overview of total XP, tasks completed and category breakdown
- **Leaderboard** — compare your progress over time
- **Persistent data** — all progress saved to localStorage, survives page refresh

---

## Tech stack

- HTML5, CSS3, vanilla JavaScript (ES Modules)
- No frameworks, no build tools
- Data loaded via `fetch` from `data.json`
- State managed in a central `state.js` module
- Storage handled by a dedicated `storage.js` module (localStorage)

---

## Project structure

```
System_v4/
├── index.html          # Onboarding page (profile setup)
├── app.html            # Main dashboard (today's tasks)
├── calendar.html       # Calendar view
├── stats.html          # Stats overview
├── leaderboard.html    # Leaderboard
├── data.json           # App config (categories, XP values)
├── css/
│   └── style.css
└── js/
    ├── state.js        # Central app state + game logic
    ├── storage.js      # localStorage read/write
    ├── app.js          # Dashboard UI + events
    ├── onboarding.js   # Profile creation flow
    ├── calendar.js     # Calendar view logic
    ├── stats.js        # Stats rendering
    └── leaderboard.js  # Leaderboard rendering
```

---

## How to run locally

1. Clone the repository
2. Open the project folder in VS Code
3. Start **Live Server** (right-click `index.html` → *Open with Live Server*)
4. App opens at `http://127.0.0.1:5500`

> A local server is required because the app uses ES Modules and `fetch` — opening `index.html` directly as a file will not work.

---

## How to play

1. Open the app and create your profile — enter a name and pick at least 2 categories
2. You'll land on the **Today** dashboard
3. Click **+ add quest** to create a task — choose a category and difficulty
4. Click the checkbox on a task to mark it done and earn XP
5. Come back every day to maintain your streak

---

## Author

Made as a project for the *Uvod u Web tehnologije* course — SIT, University of Zadar, 2026.