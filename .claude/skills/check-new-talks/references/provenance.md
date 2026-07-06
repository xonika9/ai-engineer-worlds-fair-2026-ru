# WF2026 provenance — how to tell a talk really belongs to World's Fair 2026

The AI Engineer YouTube channel (`@aiDotEngineer`) hosts videos from **many
events across several years**. Two passes polluted this repo by mistaking other
events for WF2026 — the second one specifically pulled in **AI Engineer Europe
2026** talks. These rules are the authoritative classification; the detector
encodes them. Read this when reviewing its report or judging an edge case.

## The one rule that matters

A video **is WF2026** if and only if **either**:

1. it is in an **official WF2026 playlist** — *AI Engineer World's Fair Online
   Track 2026* (`PLcfpQ4tk2k0V1LNigteMgExP1rb4Hy8wn`) or *AIE World's Fair 2026
   Complete Playlist* (`PLDyBmFH9HlVc`); **or**
2. it was **uploaded on/after 29 Jun 2026** (`FAIR_START`) and is in no other
   event's playlist.

Everything else on the channel is **not** WF2026 — including a 2026-dated video
that sits only in an evergreen `... @ AI Engineer` topic playlist and was
uploaded **before** the fair. That is the trap.

## Why the upload date is the discriminator (and topic playlists are not)

WF2026 ran **29 Jun – 2 Jul 2026**. A talk given in person cannot be uploaded
before the fair starts. The only WF2026 content published earlier is the
**online track**, and that is curated into the Online Track playlist — so rule 1
already catches it. Therefore a non-playlist upload dated *before* 29 Jun is
another event.

The event it is almost always from: **AI Engineer Europe 2026 — 8–10 Apr 2026,
London.** Europe's ~200 talks are uploaded Apr–May 2026 into the **same
evergreen `@ AI Engineer` topic playlists** (MCP, Voice, Coding Agents, …) as
WF2026 content. So "in a topic playlist + dated 2026" does **not** mean WF2026 —
this exact reasoning wrongly kept 40 Europe talks here. Only the fair date
separates them: Europe = Apr–May uploads, WF2026 = Jun–Jul uploads.

Prior years (2023–2025) are also on the channel — any pre-2026 upload is never
WF2026.

## Ground-truth sources

- Playlists / real titles / dates: `yt-dlp` (`--flat-playlist` for contents;
  `--print "%(upload_date)s|||%(title)s"` for a video). yt-dlp does not expand
  `\t` in `--print`, and video ids are **case-sensitive** — never lower-case them.
- Official WF2026 schedule: `https://www.ai.engineer/worldsfair/sessions.json`;
  Europe's is `https://www.ai.engineer/europe/sessions.json`. Note: a WF2026
  schedule match neither confirms nor denies a video — the online-track titles do
  not appear in that JSON, so the detector uses it only as a weak hint, not a gate.

## The five mistakes this skill exists to prevent

1. **Wrong event.** Classify by the rule above (playlist **or** fair-date), never
   by "it's on the AI Engineer channel". AI Engineer Europe 2026 is the easiest to
   get wrong — its talks are 2026-dated and share topic playlists with WF2026.
2. **Invented titles.** Use the **real YouTube title** verbatim (from yt-dlp),
   never a paraphrase. A prior pass renamed *Rewiring the State* → "The State of
   Vision" and gave five different talks the same made-up title.
3. **Dropped speakers.** The speaker is in the YouTube title after `:` / `–` /
   `—` / ` - `; extract it, do not write "Спикеры: не указаны" when a name is right
   there.
4. **Filling schedule slots with the wrong video.** A real WF2026 schedule session
   with no published video must stay `missing` in `manifest.csv` — do not attach an
   unrelated video to it.
5. **Broken counters / promoted junk.** After adding, keep the counts in
   `README.md` and `missing-sessions.md` in sync, and do not promote a talk in
   `highlights.md` / `topic-map.md` / `watchlist.md` unless it is confirmed WF2026.

## Reading the report / when to ask

- **TALKS TO ADD** — in a WF2026 playlist, or uploaded on/after 29 Jun. These are
  safe; the report shows `via:` (source playlists) and `uploaded` for a sanity
  glance.
- **VERIFY MANUALLY** — genuinely ambiguous (e.g. no YouTube metadata). Resolve
  before adding; if unclear, ask the user. Never add a VERIFY item blindly.
- **Excluded (pre-fair)** — the run prints a count of 2026 uploads that are not in
  a WF2026 playlist and predate the fair (assumed Europe/other). These are dropped
  on purpose. Only inspect them by hand if you suspect the anchor playlist is
  missing a real WF2026 online-track talk.
