#!/usr/bin/env node
// Detect NEW World's Fair 2026 talks on the AI Engineer channel that are not
// yet in this repo, verify each belongs to WF2026 (not another AIE event or a
// prior year), and print a report. With --scaffold, also write summary stubs
// (correct metadata, empty TODO body) and append draft `pending` manifest rows.
//
// Run from the repo root:  node .claude/skills/check-new-talks/scripts/check-new-talks.mjs [--scaffold]
// Needs `yt-dlp` on PATH and network access. Provenance rules: references/provenance.md.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SCAFFOLD = process.argv.includes("--scaffold");
const REPO = process.cwd();
const CHANNEL = "https://www.youtube.com/@aiDotEngineer/playlists";
const ONLINE_TRACK_2026 = "PLcfpQ4tk2k0V1LNigteMgExP1rb4Hy8wn"; // authoritative WF2026 online-track anchor
const SCHEDULE_URL = "https://www.ai.engineer/worldsfair/sessions.json";
const CONFERENCE_YEAR = "2026"; // WF2026 was 29 Jun – 2 Jul 2026; its uploads are 2026

const SEP = "|||"; // yt-dlp does not expand \t in --print; use a literal separator
const idFromUrl = (s) => (s.match(/[?&]v=([A-Za-z0-9_-]+)/) || [])[1];

function yt(args) {
  try {
    return execFileSync("yt-dlp", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    return (e.stdout || "").toString(); // a dead entry in a playlist should not abort the whole run
  }
}
const flatPlaylist = (url, fmt) =>
  yt(["--flat-playlist", "--no-warnings", "--print", fmt, url]).split("\n").filter(Boolean);

// Classify a playlist by title. WF2026 = World's Fair 2026 (online track /
// complete). OTHER = any different event: Europe, any year-labeled playlist that
// is not WF2026, CODE, Summit. TOPIC = evergreen "@ AI Engineer" cross-year
// playlists (year not proven by membership).
function classifyPlaylist(title) {
  const t = title.toLowerCase();
  if (/world'?s fair 2026|online track 2026|wf ?2026|aiewf ?2026/.test(t)) return "WF2026";
  if (/\b20\d\d\b|europe|code 20|summit/.test(t)) return "OTHER"; // any other year/event playlist
  return "TOPIC";
}

// --- 1. video IDs already in the repo ---
const summariesDir = path.join(REPO, "summaries");
if (!fs.existsSync(summariesDir)) {
  console.error("Run from the repo root (no ./summaries found).");
  process.exit(1);
}
// YouTube video IDs are case-sensitive and case-stable — never lower-case them,
// or yt-dlp fetches the wrong (or a missing) video.
const existing = new Set();
for (const f of fs.readdirSync(summariesDir).filter((f) => f.endsWith(".md"))) {
  const id = idFromUrl(fs.readFileSync(path.join(summariesDir, f), "utf8"));
  if (id) existing.add(id);
}
for (const m of fs.readFileSync(path.join(REPO, "manifest.csv"), "utf8").matchAll(/[?&]v=([A-Za-z0-9_-]+)/g))
  existing.add(m[1]);

// --- 2. channel playlists -> event buckets + per-video provenance ---
console.error("Fetching channel playlists…");
const playlists = flatPlaylist(CHANNEL, `%(id)s${SEP}%(title)s`)
  .map((l) => { const [id, ...t] = l.split(SEP); return { id: id.trim(), title: t.join(SEP).trim() }; })
  .filter((p) => p.id.startsWith("PL"));
if (!playlists.some((p) => p.id === ONLINE_TRACK_2026))
  playlists.push({ id: ONLINE_TRACK_2026, title: "AI Engineer World's Fair Online Track 2026" });

const wf2026Set = new Set(), otherSet = new Set(), topicSet = new Set();
const provOf = new Map(); // id -> [playlist titles it appears in]
const bucketOf = { WF2026: wf2026Set, OTHER: otherSet, TOPIC: topicSet };
for (const p of playlists) {
  const kind = classifyPlaylist(p.title);
  for (const raw of flatPlaylist(`https://www.youtube.com/playlist?list=${p.id}`, "%(id)s")) {
    const id = raw.trim();
    if (!id) continue;
    bucketOf[kind].add(id);
    (provOf.get(id) || provOf.set(id, []).get(id)).push(p.title);
  }
}

// --- 3. candidate NEW videos (in a WF2026 or topic playlist, not yet in repo) ---
const candidates = [...new Set([...wf2026Set, ...topicSet])].filter((id) => !existing.has(id));
console.error(`Candidates to check: ${candidates.length} (already in repo: ${existing.size})`);

// --- 4. official schedule for a title cross-check ---
let schedTitles = [];
try {
  const sessions = (await (await fetch(SCHEDULE_URL)).json()).sessions || [];
  schedTitles = sessions.map((s) => norm(s.title)).filter((x) => x.length > 3);
} catch { console.error("Warning: could not fetch the official schedule; skipping schedule match."); }
function norm(s) { return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); }
const scheduleMatch = (title) => {
  const n = norm(title);
  return schedTitles.includes(n) || schedTitles.some((s) => s.length > 14 && (s.includes(n) || n.includes(s)));
};

// --- 5. per-candidate metadata + verdict ---
function splitTitleSpeaker(title) {
  // AIE titles are usually "Talk Title <sep> Speaker, Company". Split on the last
  // dash/colon whose tail looks like a name; otherwise leave the speaker empty.
  for (const sep of [" — ", " – ", " - ", ": "]) {
    const i = title.lastIndexOf(sep);
    if (i > 0) {
      const tail = title.slice(i + sep.length).trim();
      if (/[,&]| and /.test(tail) || /^[A-ZÀ-Ý][\wÀ-ÿ.'-]+\s+[A-ZÀ-Ý]/.test(tail))
        return { title: title.slice(0, i).trim(), speaker: tail };
    }
  }
  return { title: title.trim(), speaker: "" };
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const toAdd = [], toVerify = [];
for (const id of candidates) {
  if (otherSet.has(id) && !wf2026Set.has(id)) continue; // another event → skip without a metadata fetch
  const raw = yt(["--skip-download", "--no-warnings", "--print", `%(upload_date)s${SEP}%(title)s`,
    `https://www.youtube.com/watch?v=${id}`]).trim();
  if (!raw) { toVerify.push({ id, ytTitle: "", reason: "no YouTube metadata (private/removed?)" }); continue; }
  const [date, ...rest] = raw.split(SEP);
  const ytTitle = rest.join(SEP).trim();
  const year = (date || "").slice(0, 4);
  const via = (provOf.get(id) || []);
  const { title, speaker } = splitTitleSpeaker(ytTitle);
  const rec = { id, ytTitle, title, speaker, date, url: `https://www.youtube.com/watch?v=${id}`,
    sched: scheduleMatch(title), via };

  if (wf2026Set.has(id)) { toAdd.push(rec); continue; }        // in a WF2026 playlist → authoritative
  if (otherSet.has(id)) continue;                               // another event → not ours
  if (year < CONFERENCE_YEAR) continue;                         // prior year → never WF2026 (silent)
  if (topicSet.has(id) && year === CONFERENCE_YEAR) { toAdd.push(rec); continue; } // 2026 topic-only, not other
  toVerify.push({ ...rec, reason: `ambiguous (${year}); confirm the event before adding` });
}

// --- 6. report ---
const line = "─".repeat(60);
console.log(`\n${line}\nNEW WF2026 TALKS TO ADD: ${toAdd.length}\n${line}`);
for (const r of toAdd.sort((a, b) => (a.date || "").localeCompare(b.date || ""))) {
  console.log(`• ${r.title}${r.speaker ? "  —  " + r.speaker : "  —  (no speaker in title; verify)"}`);
  console.log(`  ${r.url}   uploaded ${r.date}   schedule: ${r.sched ? "yes" : "no (may be expo/online)"}`);
  console.log(`  via: ${r.via.join("; ") || "(anchor playlist)"}`);
}
console.log(`\n${line}\nVERIFY MANUALLY (do NOT add blindly): ${toVerify.length}\n${line}`);
for (const r of toVerify) console.log(`• ${r.ytTitle || r.id}  [${r.id}]\n  → ${r.reason}`);
if (!toAdd.length && !toVerify.length) console.log("Nothing new. Repo is current with WF2026 uploads.");

// --- 7. optional scaffolding ---
if (SCAFFOLD && toAdd.length) {
  const q = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const draftRows = [];
  for (const r of toAdd) {
    const file = path.join(summariesDir, `${slugify(r.title)}-${r.id.toLowerCase()}.md`);
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(file, stub(r));
    // CSV: title,speakers,track,youtube_url,source_url,status,relevance,summary_path
    draftRows.push([r.title, r.speaker, "", r.url,
      "https://www.ai.engineer/worldsfair/schedule", "pending", "3", ""].map(q).join(","));
  }
  if (draftRows.length) fs.appendFileSync(path.join(REPO, "manifest.csv"), draftRows.join("\n") + "\n");
  console.log(`\nScaffolded ${draftRows.length} stub(s) in summaries/ and appended draft "pending" manifest rows.`);
  console.log(`Fill each body, then flip the row status "pending"→"summarized" and set summary_path. Then: cd site && npm test.`);
}

function stub(r) {
  return `# ${r.title}

- Спикеры: ${r.speaker || "TODO — не указаны"}
- Трек: TODO
- Видео: [YouTube](${r.url})
- Официальный источник: [расписание AI Engineer World's Fair](https://www.ai.engineer/worldsfair/schedule)
- Статус обработки: pending

> Это русскоязычное саммари. Полные расшифровки и медиафайлы здесь не публикуются.

## 1. О чём доклад
TODO

## 2. Главные идеи
- TODO

## 3. Практические выводы
- TODO

## 4. Упомянутые инструменты, фреймворки, компании, продукты и подходы
- TODO

## 5. Что полезно разработчику
- TODO

## 6. Что можно применить в агентных продуктах
- TODO

## 7. Стоит ли смотреть полностью
TODO

## 8. Самые важные таймкоды
- TODO
`;
}
