# AGENTS.md

Two layers: hand-authored content at the repo root (`summaries/`, `manifest.csv`, `watchlist.md`, `highlights.md`, `topic-map.md`) and a static site in `site/` (Vite + React + TypeScript) that renders it and deploys to GitHub Pages.

## Commands

All npm scripts live in `site/` — the repo root has no `package.json`. Run from `site/`:

- `npm ci` — install (CI uses Node 22).
- `npm run dev` — local dev server on `127.0.0.1` (regenerates data first).
- `npm test` — regenerate data, then validate integrity + check for private/media leaks.
- `npm run test:live` — same, plus verify every timestamp against the real YouTube duration (needs `yt-dlp` on PATH).
- `npm run build` — `tsc -b && vite build` → `site/dist`.

## Summary format

`site/scripts/build-data.mjs` parses each `summaries/<slug>.md` into one session; it keys off section titles, so the shape is load-bearing — break it and fields drop silently.

- First line `# Title`. Speakers come from a `- Спикеры:` bullet; if that bullet is absent, a trailing ` - Speaker, Company` is split off the title instead.
- Header bullets: `- Спикеры:`, `- Видео: [YouTube](url)` (source of `youtubeUrl`), `- Статус обработки:`.
- Numbered `##` sections. Four titles are matched by regex and feed specific UI; the rest are stored but not rendered:
  - `О чём доклад` → the card teaser **and** the detail "Коротко" block. (Not "Что полезно…" — that section carries meta phrasing like "прямых упоминаний нет" and must not become the teaser.)
  - `Главные идеи` → detail "Главные идеи".
  - `Практические выводы` → detail "Практически полезно".
  - `Самые важные таймкоды` → the timecodes panel. Timecodes are parsed **only** from inside this section.
- Timecode lines: one per line, any marker (`-`, `*`, `•`, `N.`); the time may be bare, in `` `backticks` `` or `[brackets]`; ranges are `[start] — [end]` with any dash. A line whose label is under 4 chars is dropped, so a bare timestamp with no description will not render.
- The 1–5 relevance dots come from the watch tier in `watchlist.md` (Must watch=5, Worth skimming=4, Only if needed=2), falling back to the manifest's `relevance`. This is a separate signal from the tier badge (Главное/Полезное/Нишевое/Справочно).
- Summary prose is rendered with a minimal Markdown subset: `**bold**`, `*italic*`, `` `code` ``, `[links]`, and `-`/`*`/`•`/`N.` list items grouped into `<ul>`/`<ol>`. Other Markdown is shown literally.

## Constraints

- `site/public/data/sessions.json` is **generated** by `site/scripts/build-data.mjs` and committed. Do not hand-edit it — the `predev`/`pretest`/`prebuild` hooks overwrite it. To change site content, edit the sources it reads: `manifest.csv`, `watchlist.md`, and `summaries/*.md`.
- Never commit private source material — `raw/`, `transcripts/`, downloaded video/audio, full transcripts, or raw dumps. `.gitignore` blocks all `*.json` except an explicit whitelist for this reason. `npm test` fails if public data contains tokens like `/Users/`, `raw/`, `.vtt`, or `.mp4`.
- `npm test` also enforces: ≥80 sessions, timestamps sorted ascending and (with `test:live`) within video length, ≥3 sections per session, and a ≥20-char excerpt. Edits that break these fail the gate and block deploy.
- The Vite `base` is `/ai-engineer-worlds-fair-2026-ru/`; build internal links and asset URLs from `import.meta.env.BASE_URL`, never a bare `/` (it resolves to the domain root and 404s on Pages).

## Conventions

- Content prose (summaries, README, navigation) is Russian; these agent files stay English.
- Commits follow Conventional Commits (`docs(readme): …`, `fix: …`).
- Pushing to `main` triggers the GitHub Pages workflow, which runs `npm test` then `npm run build` — a failing test blocks deploy.
