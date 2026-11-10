---
title: "PacePilot"
summary: "An academic planner for NUS students. It reads your module documents, predicts your final grades, plans your study week, and messages your deadlines to you on Telegram."
status: live
order: 5
role: "NUS Orbital 2026, team of 2. TODO: achievement level (Gemini / Apollo)"
stack: [Next.js, TypeScript, FastAPI, Python, Supabase, XGBoost, Claude API, MicroPython, Raspberry Pi Pico 2 W, GitHub Actions]
links:
  - label: Open the app
    url: "https://nus-orbital.vercel.app/"
  - label: Code on GitHub
    url: "https://github.com/les-1001/NUS-Orbital"
---

## What it does

NUS students juggle five or six modules, each with its own assessments, weights and deadlines spread across PDFs and Canvas pages. PacePilot puts all of it in one place and tells you where to spend your time.

- **Import a module in seconds.** Upload a syllabus PDF, Word file or screenshot, and PacePilot pulls out every assessment and its weight. Module details come from the NUSMods API.
- **See where you're heading.** As scores come in, PacePilot predicts your final grade with a pessimistic-to-optimistic range, and marks each module On Track, Needs Attention or At Risk.
- **Plan your CAP.** A GPA/CAP calculator follows NUS's S/U rules for your intake year and suggests which modules to S/U for the biggest CAP gain.
- **Plan your week.** A study planner finds free slots in your Google Calendar and gives more hours to the modules you're struggling with.
- **Get reminded.** Link Telegram and a bot messages you before deadlines. You can also manage tasks from the chat, for example `/add CS2040S Problem Set 4 tomorrow`.

## How it's built

- **Frontend:** Next.js and React in TypeScript, deployed on Vercel.
- **Backend:** a Python FastAPI service on Railway. It handles grade prediction, document extraction with the Claude API, and the Telegram bot.
- **Data and login:** Supabase (Postgres) with row-level security, so each student can only read their own rows.
- **Telegram relay:** a Raspberry Pi Pico 2 W running MicroPython. It passes messages between Telegram and the backend.
- **CI/CD:** every push runs a dependency audit, lint, about 170 automated tests and a production build in GitHub Actions. Pushes to `main` then deploy automatically.

## What I built

My teammate designed the interface and built the grade-prediction model, the Google Calendar sync and the career and degree planners. My parts were:

- **The backend and data layer.** I set up the FastAPI service and moved our storage from browser localStorage to Supabase, with row-level security on every table.
- **Document import.** An endpoint takes a PDF, DOCX or image, has Claude extract the assessments and weights as JSON, and validates the result before the student sees it.
- **The Telegram bot, end to end.** I wrote the Pico firmware, the backend reminder scanner and 12 bot commands.
- **The task tracker and the GPA/CAP calculator**, including the S/U optimiser.
- **Real-data training for the grade model**, plus a cohort percentile shown on the dashboard.
- **Study-session tracking**, which feeds back into the weekly schedule.
- **The CI/CD pipeline** and most of the backend test suite.

## Problems worth mentioning

**A bot server on a small microcontroller.** The Pico 2 W has 520 KB of RAM, so it can't hold per-user data. I made it a stateless relay. It polls Telegram, forwards each command to the backend, and delivers whatever reminders the backend has queued. All state lives in Supabase, so memory use stays flat however many students sign up. The device authenticates with its own API key. Accounts are linked with one-time codes that expire after 10 minutes. When the Wi-Fi drops, the Pico reconnects by itself. A failed reply never rewinds the message offset, so a command can't run twice.

**A model trained on made-up data.** The grade model started out trained only on a synthetic NUS cohort. I built a pipeline that collects real outcomes from students who opt in. It strips names and IDs and stores only module features and the final grade, with a one-way hash so re-runs don't duplicate rows. Real rows count 25 times as much as synthetic ones in training, so the model moves toward real data as it comes in. The cohort percentile only uses real grades once a faculty and level has at least 20 of them. Until then, the dashboard labels the number as an estimate.

**Schedules that adapt.** Students log their study sessions. If you studied less for a module than planned last week, it gets more time this week. The boost is capped, so one skipped week can't take over the schedule. I pulled the scheduling and CAP logic out of the React pages into pure functions so they could be unit-tested.

**Small bugs that would erode trust.** Deadline maths ran on the server's clock, so a deadline "tomorrow" could be off by a day for students in Singapore. I moved it all to Singapore time. FastAPI validation errors were showing up as "[object Object]", so I made the frontend read the real error message.

## Timeline

| When | Milestone |
|---|---|
| May 2026 | FastAPI backend and auth, Supabase migration, document import with Claude, first deploy |
| June 2026 | Task tracker, S/U optimiser, CI/CD pipeline, grade prediction v2 |
| July 2026 | Telegram bot on the Pico 2 W, 12 bot commands, deadline reminders |
| August 2026 | Real-data training pipeline, cohort percentile, adaptive study scheduling |

## What I learned

- **Design for the smallest machine first.** The Pico's memory limit pushed me toward a stateless design, and that turned out simpler and more reliable than a stateful one.
- **Be honest about where a number comes from.** A prediction that looks precise but rests on synthetic data misleads people. Labelling the source mattered as much as the model.
- **Pure functions and CI make teamwork safer.** With the scheduling and CAP logic tested on every push, UI changes couldn't quietly break the maths.
- **Splitting work in a team of two.** We divided the app by feature, built on a `dev` branch and merged into `main` for releases.

## Screenshots

TODO: add 2 or 3 screenshots so the page still works if the backend is asleep. Save them in `public/images/orbital/` and add them like this:

![Home screen](/images/orbital/home.png)
