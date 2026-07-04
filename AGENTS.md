# AGENTS.md

Two layers: hand-authored content at the repo root (`summaries/`, `manifest.csv`, `watchlist.md`, `highlights.md`, `topic-map.md`) and a static site in `site/` (Vite + React + TypeScript) that renders it and deploys to GitHub Pages.

## Commands

All npm scripts live in `site/` — the repo root has no `package.json`. Run from `site/`:

- `npm ci` — install (CI uses Node 22).
- `npm run dev` — local dev server on `127.0.0.1` (regenerates data first).
- `npm test` — regenerate data, then validate integrity + check for private/media leaks.
- `npm run test:live` — same, plus verify every timestamp against the real YouTube duration (needs `yt-dlp` on PATH).
- `npm run build` — `tsc -b && vite build` → `site/dist`.

## Constraints

- `site/public/data/sessions.json` is **generated** by `site/scripts/build-data.mjs` and committed. Do not hand-edit it — the `predev`/`pretest`/`prebuild` hooks overwrite it. To change site content, edit the sources it reads: `manifest.csv`, `watchlist.md`, and `summaries/*.md`.
- Never commit private source material — `raw/`, `transcripts/`, downloaded video/audio, full transcripts, or raw dumps. `.gitignore` blocks all `*.json` except an explicit whitelist for this reason. `npm test` fails if public data contains tokens like `/Users/`, `raw/`, `.vtt`, or `.mp4`.
- Each `summaries/<slug>.md` must keep the structure the parser depends on: a `# Title` line, a `- Спикеры:` line, a `- Видео: [YouTube](url)` line, and `##`/numbered sections including a timecodes section. Break that shape and the session parses wrong or silently drops fields.
- The Vite `base` is `/ai-engineer-worlds-fair-2026-ru/`, so local URLs live under that path, not `/`.

## Conventions

- Content prose (summaries, README, navigation) is Russian; these agent files stay English.
- Commits follow Conventional Commits (`docs(readme): …`, `fix: …`).
- Pushing to `main` triggers the GitHub Pages workflow, which runs `npm test` then `npm run build` — a failing test blocks deploy.
