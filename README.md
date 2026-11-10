# Portfolio site

My portfolio and public progress log. Built with Astro and hosted free on GitHub Pages. Every push to `main` rebuilds and redeploys it in about a minute.

## Where things are

| What | Where |
|---|---|
| Name, tagline, contact links, CV | `src/site.config.ts` |
| Project pages | `src/content/projects/*.md` |
| Progress updates | `src/content/log/*.md` |
| Images and the CV PDF | `public/` (e.g. `public/images/orbital/home.png` is served at `/images/orbital/home.png`) |

## Post an update

Make a new file in `src/content/log/`, named like `2026-11-20-teacher-overfits.md`:

```markdown
---
title: The teacher overfits 64 samples
date: 2026-11-20
project: humanoid-mimic
---

What happened, what it means, what's next.
```

`project` must match a file name in `src/content/projects/` (without `.md`): `humanoid-mimic`, `calibur-gpu-latency`, `calibur-yolo-tuning`, `calibur-aim-tools`, `orbital` or `urex`. Commit and push. That's it.

You can do this from the GitHub website too: open `src/content/log/`, click **Add file > Create new file**, paste the template, and commit.

## Add a project

Copy one of the files in `src/content/projects/`. `status` is `live`, `in-progress`, `upcoming` or `planned`. If the title is long, add a short `tabLabel` for the home-page tab. Add `start: "2026-05"` and `end: "2026-08"` for the duration shown next to the status. Leave out `end` and it shows "Present".

To put several projects under one home-page tab (like NUS Calibur), add `group: calibur` to each project. The group's own title, summary and position live in `src/content/groups/calibur.md`. Inside the group, the projects' `order` sets the order of the sub-tabs. `order` sets the position on the home page (smaller first). The first entry in `links` becomes the big button.

## Preview locally (optional)

Needs Node.js 22 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:4321.

## First-time setup on GitHub

1. Create a **public** repo named exactly `les-1001.github.io`.
2. Push this folder to it on the `main` branch.
3. In the repo, go to **Settings > Pages** and set **Source** to **GitHub Actions**.
4. Wait for the "Deploy to GitHub Pages" action to go green, then open https://les-1001.github.io.
