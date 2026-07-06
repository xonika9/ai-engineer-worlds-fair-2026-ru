# WF2026 provenance — how to tell a talk really belongs to World's Fair 2026

The AI Engineer YouTube channel (`@aiDotEngineer`) hosts videos from **many
events across several years**. A prior pass polluted this repo by treating any
channel video as WF2026: of 266 it added, 225 were from other events. These
rules are how to classify authoritatively. The detector script encodes them;
read this when reviewing its report or judging an edge case.

## The authoritative signal: playlist membership

The channel groups videos into playlists. Classify each **playlist** by title:

- **WF2026** — title matches `World's Fair 2026`, `Online Track 2026`, `WF2026`,
  or `AIEWF 2026`. The anchor is *AI Engineer World's Fair Online Track 2026*
  (`list=PLcfpQ4tk2k0V1LNigteMgExP1rb4Hy8wn`).
- **OTHER EVENT** — anything with `Europe`, `2025`, `2024`, `2023`, `CODE 20xx`,
  or `Summit`. **AI Engineer Europe 2026 is a different conference** — its
  uploads are also dated 2026, so year alone will not exclude it; only its
  playlists do.
- **TOPIC (evergreen)** — `... @ AI Engineer` playlists (MCP, Coding Agents,
  Voice, …). These are **cross-year** — a talk being in one does *not* prove
  the year.

A video **is WF2026** when it is in a WF2026 playlist, **or** it is in a topic
playlist **and** uploaded in **2026** **and** in **no** OTHER-EVENT playlist.
Everything else is not ours.

Second signal, `upload_date`: WF2026 was **29 Jun – 2 Jul 2026**; its videos are
uploaded in 2026 (online track through spring, in-person from July). Any
2023–2025 upload is a prior event — never WF2026.

## Ground-truth sources

- Playlists / real titles / dates: `yt-dlp` (`--flat-playlist` for contents;
  `--print "%(upload_date)s|||%(title)s"` for a video). yt-dlp does not expand
  `\t` in `--print`; use a literal separator.
- Official schedule (561 sessions, `title`/`speakers`/`track`):
  `https://www.ai.engineer/worldsfair/sessions.json`. A schedule match confirms
  WF2026 but its absence does not disprove it — the online track and many expo
  talks are not in the schedule JSON, and in-person videos are published late.

## The five mistakes this skill exists to prevent

1. **Wrong event.** Verify every candidate by playlist provenance above, not by
   "it's on the AI Engineer channel". Europe 2026 / WF2025 look plausible and
   are the easiest to get wrong.
2. **Invented titles.** Use the **real YouTube title** verbatim (from yt-dlp),
   never a paraphrase. The prior pass renamed *Rewiring the State* → "The State
   of Vision" and gave five different talks the same made-up title.
3. **Dropped speakers.** The speaker is in the YouTube title after `:` / `–` /
   `—` / ` - `; extract it, do not write "Спикеры: не указаны" when a name is
   right there.
4. **Filling schedule slots with the wrong video.** A real WF2026 schedule
   session with no published video must stay `missing` in `manifest.csv` — do
   not attach an unrelated video (different real title) to it.
5. **Broken counters / promoted junk.** After adding, keep the counts in
   `README.md` and `missing-sessions.md` in sync, and do not promote a talk in
   `highlights.md` / `topic-map.md` / `watchlist.md` unless it is confirmed
   WF2026.

## Reading the report / when to ask

The detector puts a 2026 upload that is not in any OTHER-event playlist under
**TALKS TO ADD** and prints its `via:` provenance (the playlists it came from).
Only WF2026 and Europe 2026 run in 2026, and Europe playlists are OTHER, so a
2026 topic-only video is almost always WF2026 — but **sanity-check `via:`**: if a
source playlist names a different 2026 event, treat it as OTHER and ask the user
rather than adding.

Prior-year and other-event videos are dropped silently (year `< 2026` is
authoritative proof of not-WF2026). **VERIFY MANUALLY** holds only genuinely
ambiguous cases (e.g. no YouTube metadata). Never add a VERIFY item without
resolving it first.
