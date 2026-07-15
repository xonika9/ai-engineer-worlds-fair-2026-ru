# Summarizing and shipping — the operational playbook

The "how" behind SKILL.md steps 3–6: turn a provenance-verified TO-ADD list into
committed, deploy-ready summaries. Which videos qualify is provenance.md; this file
is everything after that. Read it before writing any summary.

## Contents

1. Get the talk content — never invent it
2. "private / unavailable / premiere" is a hint, not proof
3. Re-uploads: a "new" id that is an already-covered talk
4. Speaker attribution: the YouTube title wins
5. Writing many summaries — parallel subagents
6. Wire in and sync counts — exact locations
7. Ship

## 1. Get the talk content — never invent it

A summary body and its timecodes must come from the real talk. Fetch transcripts:

```bash
node .claude/skills/check-new-talks/scripts/fetch-transcripts.mjs <id> [<id>...]
```

- Writes `transcripts/<id>.txt` (gitignored): de-duplicated English auto-captions
  with `[H:MM:SS]` markers. Prints `upload_date` + `duration` per id, and `SKIP`
  with a reason for anything it can't fetch.
- `transcripts/` and `*.vtt` are **private source material** — never commit them,
  never put a transcript path in a summary. `npm test` fails on `/Users/`, `raw/`,
  `transcripts/`, `.vtt` tokens in public data.
- **Every timecode must be `<=` the printed duration** (`npm run test:live`
  enforces it; stay within duration even for the plain `npm test`). Timecodes live
  only in «Самые важные таймкоды», sorted ascending, each label `>= 4` chars.

## 2. "private / unavailable / premiere" is a hint, not proof

The detector's VERIFY-MANUALLY items and fetch `SKIP`s are usually:

- **"Premieres in N days"** — scheduled, not yet public. Leave it out; it returns
  as a normal TO-ADD candidate on a later run once it airs.
- **"Private video" / "Video unavailable"** — inaccessible now. Same: leave out.

For both, do **not** add an `excluded` manifest row — that suppresses the video
forever, but you *want* these to resurface when they become watchable. These states
flip: a public video can transiently return "Private", and premieres go public. So
before concluding a video is gone, **retry and cross-check** (e.g. the YouTube
`oembed`/watch page); never delete an existing summary on a single failed fetch.
Only genuinely ambiguous *provenance* (not mere inaccessibility) → ask the user.

## 3. Re-uploads: a "new" id that is an already-covered talk

Before summarizing, cross-check each TO-ADD title against existing summaries:

```bash
for f in summaries/*.md; do head -1 "$f"; done | sort
```

A title (and speaker) matching an existing summary is almost always a **re-upload**
— the channel re-published a talk under a new id and the old id is now "Video
unavailable". Do **not** add a second summary. Repoint the existing one to the live id:

- the `- Видео:` line in `summaries/<old>.md`,
- the `youtube_url` in its `manifest.csv` row,
- any curated refs (`topic-map.md`, `highlights.md`, `watchlist.md`, README top-10),
- and re-derive the timecodes if the re-upload's timing differs (it often does —
  a longer cut, an added live demo).

Then delete the scaffolded duplicate stub and remove its `pending` manifest row.
Keep the existing filename — its slug is the site id and may be linked elsewhere.

## 4. Speaker attribution: the YouTube title wins

The real YouTube title (from the detector / fetch script) is authoritative for title
and speaker — use both verbatim, do not paraphrase. Auto-caption ASR routinely
mangles names (e.g. "Mike, Thundra" for "May Walter, Hud"). If the transcript
contradicts the title on a load-bearing name, verify by web search, keep the title's
attribution, and write the body neutrally rather than assert a wrong name.

## 5. Writing many summaries — parallel subagents

One transcript per talk is a lot of context; do not read them all yourself. Dispatch
parallel subagents, a few talks each. Give every subagent:

- the exact section contract (the repo `AGENTS.md` summary format),
- an existing high-quality summary as the style example
  (e.g. `summaries/your-coding-agent-is-creating-review-debt-tjpinbjhe4q.md`),
- the transcript path and the duration bound,
- the rule: base every claim on the transcript, carry ASR-garbled names/products
  through cautiously, invent nothing.

`npm test` is the backstop — it fails on missing sections, short excerpts,
unsorted/over-length timecodes, and private-data leaks. Still spot-read the hardest
one or two summaries yourself for taste and grounding.

## 6. Wire in and sync counts — exact locations

Flip each new row `pending`→`summarized` and set its `summary_path` (match the stub
by its lowercased video id in the filename). Then update:

- `README.md`: «Обработано уникальных YouTube-видео: N» and «Доступно саммари: N» —
  both equal the `summarized` count.
- `missing-sessions.md`: the «В актуальном реестре R строк: N записей просуммированы,
  … 505 schedule-сессий пока не найдены» line, and the «Обновлено … : YYYY-MM-DD» date.
  R = total manifest rows.
- Leave «сегментов» (`longStreamSegments` = distinct titles among
  `found_in_long_stream`) and the "not found" (`missing`) count untouched unless you
  actually added a segment or filled a schedule slot.

Cross-check against the regenerated `site/public/data/sessions.json` `stats` block
after `npm test` — it computes `manifestRows` / `summaries` / `missing` /
`longStreamSegments` for you.

## 7. Ship

- `cd site && npm test` green (regenerates data, enforces every gate).
- Confirm with the user, then commit (Conventional Commit) and push to `main`.
  Pushing triggers the Pages workflow (`npm test` → build → deploy). Never push
  before the test is green **and** the user has confirmed.
