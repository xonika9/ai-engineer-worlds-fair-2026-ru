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
- Steps 3–6 (scaffold → write → wire → ship) are detailed in
  [references/summarizing.md](references/summarizing.md) — the operational playbook,
  including the transcript pipeline, re-upload handling, and exact count locations.

## Workflow

1. **Detect.** Run the detector. Add `--scaffold` only once you intend to add
   the results (it writes stub files):
   ```bash
   node .claude/skills/check-new-talks/scripts/check-new-talks.mjs
   ```
   It lists **TALKS TO ADD** (in a WF2026 playlist, or uploaded on/after the
   29 Jun fair date) and **VERIFY MANUALLY** (e.g. no metadata). It silently
   drops other-event videos and prints a count of **excluded pre-fair 2026
   uploads** — those are AI Engineer Europe / other events, not WF2026 (see
   references/provenance.md for why upload date is the discriminator).

2. **Review before touching anything.** For each "VERIFY MANUALLY" item, confirm
   provenance per references/provenance.md; if still unclear, **ask the user** —
   never add an unverified talk. Most VERIFY items are premieres or private/
   unavailable videos — inaccessible, not other-event: leave them out (they
   resurface when public), don't `excluded`-suppress them. See
   [references/summarizing.md](references/summarizing.md) §2. The "TO ADD" items
   already carry the real YouTube title and speaker: use them verbatim, do not
   paraphrase. **Cross-check each TO-ADD title against existing summaries** — a
   match is usually a re-upload of an already-covered talk (repoint, don't
   duplicate; summarizing.md §3), not a new one.
   To permanently suppress a real WF2026 video you deliberately do *not* want
   (e.g. a montage reel), add a `manifest.csv` row with its `youtube_url` and
   status `excluded` (no `summary_path`) — the detector treats any video already
   referenced in `manifest.csv` as known, so it will not resurface.

3. **Scaffold** (optional) to create the files: re-run with `--scaffold`. Each
   new talk gets `summaries/<slug>.md` with correct metadata and a TODO body,
   plus a draft `pending` row in `manifest.csv` (pending rows do not render and
   do not break the build).

4. **Write the summary.** Base every body and timecode on the real talk — fetch
   its transcript first (this also re-checks upload date and gives the duration
   your timecodes must stay within):
   ```bash
   node .claude/skills/check-new-talks/scripts/fetch-transcripts.mjs <id> [<id>...]
   ```
   It writes `transcripts/<id>.txt` (gitignored — **never commit transcripts**).
   Fill each stub in Russian per the AGENTS.md format (sections keyed by title;
   timecodes only inside «Самые важные таймкоды», sorted, each ≤ the video length).
   For many talks, dispatch parallel subagents — see
   [references/summarizing.md](references/summarizing.md) §§1,4,5. Do not invent
   content; carry ASR-garbled names/products through cautiously.

5. **Wire it in.** Flip that manifest row `status` `pending`→`summarized` and set
   its `summary_path`. Do not attach a video to an existing `missing` schedule
   slot unless the real title matches it.

6. **Sync counts** in `README.md` and `missing-sessions.md` — exact lines and the
   `sessions.json` `stats` cross-check are in
   [references/summarizing.md](references/summarizing.md) §6 (summaries total; the
   not-found count drops only if you actually filled a schedule slot; leave the
   segment count alone). Do not promote a talk in `highlights.md` / `topic-map.md` /
   `watchlist.md` unless it is confirmed WF2026.

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
| [references/summarizing.md](references/summarizing.md) | Before scaffolding/writing — the playbook for transcripts, re-uploads, VERIFY cases, parallel summarizing, count sync, and shipping. |
| [scripts/check-new-talks.mjs](scripts/check-new-talks.mjs) | The detector/scaffolder. Read it only to change detection behavior. |
| [scripts/fetch-transcripts.mjs](scripts/fetch-transcripts.mjs) | Run in step 4 to pull each talk's transcript + duration. Read it only to change transcript handling. |
