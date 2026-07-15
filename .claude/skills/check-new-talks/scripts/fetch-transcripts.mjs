#!/usr/bin/env node
// Fetch the raw material a WF2026 summary is built from: for each YouTube video
// id, download English auto-captions and emit a clean, de-duplicated transcript
// with periodic [H:MM:SS] timestamps. Also prints upload_date + duration so you
// can (a) re-check provenance at a glance and (b) keep every timecode within the
// video length. Output goes to a gitignored dir — transcripts are PRIVATE source
// material and must never be committed (see the repo .gitignore: transcripts/,
// *.vtt). Read the .txt files, write the Russian summary, do not add them to git.
//
// Run from the repo root:
//   node .claude/skills/check-new-talks/scripts/fetch-transcripts.mjs [--out <dir>] <id> [<id>...]
// Default --out is ./transcripts (gitignored). Needs `yt-dlp` on PATH + network.
// Video ids are case-sensitive and may start with "-"; pass them verbatim.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const argv = process.argv.slice(2);
let outDir = "transcripts";
const ids = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--out") { outDir = argv[++i]; continue; }
  ids.push(argv[i]);
}
if (!ids.length) {
  console.error("usage: fetch-transcripts.mjs [--out <dir>] <videoId> [<videoId>...]");
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const SEP = "|||";
const hms = (sec) => {
  sec = Math.floor(Number(sec) || 0);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
const tsToHMS = (t) => { const [h, m, s] = t.split(":"); return `${parseInt(h)}:${m}:${String(Math.floor(parseFloat(s))).padStart(2, "0")}`; };
const toSec = (t) => { const p = t.split(":").map(Number); return p[0] * 3600 + p[1] * 60 + p[2]; };

function yt(args) {
  try { return execFileSync("yt-dlp", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] }); }
  catch (e) { return { err: (e.stderr || e.stdout || String(e)).toString() }; }
}

// Rolling auto-captions repeat lines and carry inline timing tags; keep the newly
// revealed text per cue, drop consecutive duplicates, bucket ~every 30s.
function vttToText(vtt) {
  const cues = [];
  let start = null;
  for (const line of vtt.split(/\r?\n/)) {
    const m = line.match(/^(\d{2}:\d{2}:\d{2})\.\d{3}\s+-->/);
    if (m) { start = m[1]; continue; }
    if (start == null || !line.trim()) continue;
    const text = line.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim();
    if (text) { cues.push({ start, text }); start = null; }
  }
  const dedup = [];
  for (const c of cues) if (!dedup.length || dedup[dedup.length - 1].text !== c.text) dedup.push(c);
  const out = [];
  let bStart = null, bText = [], last = -999;
  const flush = () => { if (bText.length) out.push(`[${tsToHMS(bStart)}] ${bText.join(" ")}`); bText = []; bStart = null; };
  for (const c of dedup) {
    if (bStart == null) { bStart = c.start; last = toSec(tsToHMS(c.start)); }
    bText.push(c.text);
    if (toSec(tsToHMS(c.start)) - last >= 30) { flush(); }
  }
  flush();
  return out.join("\n") + "\n";
}

for (const id of ids) {
  const url = `https://www.youtube.com/watch?v=${id}`;
  const meta = yt(["--skip-download", "--no-warnings", "--print", `%(upload_date)s${SEP}%(duration)s${SEP}%(title)s`, url]);
  if (meta.err || !String(meta).trim()) {
    const why = /Premieres/i.test(meta.err || "") ? "premiere (not yet public)"
      : /Private/i.test(meta.err || "") ? "private video"
      : /unavailable/i.test(meta.err || "") ? "video unavailable"
      : "no metadata";
    console.log(`SKIP ${id} | ${why} — resolve per references/provenance.md (do not add blindly)`);
    continue;
  }
  const [date, dur, ...rest] = String(meta).trim().split(SEP);
  const title = rest.join(SEP);
  // download auto-subs into outDir; yt-dlp writes <id>.en-orig.vtt / <id>.en.vtt
  yt(["--skip-download", "--write-auto-subs", "--sub-langs", "en.*,en", "--sub-format", "vtt",
    "--no-warnings", "-o", path.join(outDir, "%(id)s.%(ext)s"), url]);
  const cand = [`${id}.en-orig.vtt`, `${id}.en.vtt`].map((f) => path.join(outDir, f)).find((p) => fs.existsSync(p));
  if (!cand) { console.log(`SKIP ${id} | captions unavailable | uploaded ${date} | ${title}`); continue; }
  const txt = path.join(outDir, `${id}.txt`);
  fs.writeFileSync(txt, vttToText(fs.readFileSync(cand, "utf8")));
  console.log(`OK   ${id} | uploaded ${date} | ${hms(dur)} (${dur}s) — timecodes must be <= this | file: ${txt}`);
  console.log(`       title: ${title}`);
}
