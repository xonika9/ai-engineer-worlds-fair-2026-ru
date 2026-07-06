---
name: check-new-talks
description: Use in the ai-engineer-worlds-fair-2026-ru repo to check whether NEW World's Fair 2026 talks have appeared on YouTube and should be added — «проверь новые доклады», «появились ли новые материалы конференции», «обнови саммари», "check for new WF2026 talks", a weekly refresh. Detects new channel videos, verifies each is really WF2026 (not AI Engineer Europe 2026, World's Fair 2025, CODE, Summit, or an older year), and reports them with correct title/speaker, optionally scaffolding stubs. Do NOT use to invent summary bodies, to add videos from other events, or outside this repo.
---

# check-new-talks

Find genuinely new **AI Engineer World's Fair 2026** talks and propose them for
this repo — without the contamination a prior pass introduced (it pulled 225
videos from other events and years, invented titles, and dropped speakers).

The hard part is not fetching videos; it is proving a video belongs to WF2026.
**Read [references/provenance.md](references/provenance.md) first** — it holds the
authoritative playlist/upload-date rules and the five specific mistakes to avoid.

## Prerequisites

- Run from the repo root. Needs `yt-dlp` on PATH and network access.
- The summary format is the parser contract in the repo's `AGENTS.md` (and
  `site/scripts/build-data.mjs`). Follow it for any body you write.

## Workflow

1. **Detect.** Run the detector. Add `--scaffold` only once you intend to add
   the results (it writes stub files):
   ```bash
   node .claude/skills/check-new-talks/scripts/check-new-talks.mjs
   ```
   It lists **TALKS TO ADD** (verified WF2026) and **VERIFY MANUALLY**
   (ambiguous — a 2026 upload seen only in a cross-year topic playlist, or no
   metadata). It skips other-event videos silently.

2. **Review before touching anything.** For each "VERIFY MANUALLY" item, confirm
   provenance per references/provenance.md; if still unclear, **ask the user** —
   never add an unverified talk. The "TO ADD" items already carry the real
   YouTube title and speaker: use them verbatim, do not paraphrase.
   To permanently suppress a real WF2026 video you deliberately do *not* want
   (e.g. a montage reel), add a `manifest.csv` row with its `youtube_url` and
   status `excluded` (no `summary_path`) — the detector treats any video already
   referenced in `manifest.csv` as known, so it will not resurface.

3. **Scaffold** (optional) to create the files: re-run with `--scaffold`. Each
   new talk gets `summaries/<slug>.md` with correct metadata and a TODO body,
   plus a draft `pending` row in `manifest.csv` (pending rows do not render and
   do not break the build).

4. **Write the summary.** Fill the stub body in Russian per the AGENTS.md format
   (sections keyed by title; timecodes only inside «Самые важные таймкоды»). Do
   not invent content — base it on the actual talk.

5. **Wire it in.** Flip that manifest row `status` `pending`→`summarized` and set
   its `summary_path`. Do not attach a video to an existing `missing` schedule
   slot unless the real title matches it.

6. **Sync counts** in `README.md` and `missing-sessions.md` (summaries total;
   the not-found count drops only if you actually filled a schedule slot). Do not
   promote a talk in `highlights.md` / `topic-map.md` / `watchlist.md` unless it
   is confirmed WF2026.

## Success criterion

- `cd site && npm test` passes (it regenerates data and enforces integrity — no
  private leaks, sections/timecodes present, counts consistent).
- Every "VERIFY MANUALLY" item was resolved (added with proof, or left out) — not
  silently ignored.
- Commit/push only after `npm test` is green and the user confirms; pushing to
  `main` triggers the GitHub Pages deploy.

## Files

| Path | When to read |
|---|---|
| [references/provenance.md](references/provenance.md) | Before reviewing the report or judging any edge case — the WF2026 classification rules and the five pitfalls. |
| [scripts/check-new-talks.mjs](scripts/check-new-talks.mjs) | The detector/scaffolder. Read it only to change detection behavior. |
