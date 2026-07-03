import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const dataPath = path.resolve(repoRoot, "site/public/data/sessions.json");
const cachePath = path.resolve(repoRoot, ".cache/youtube-durations.json");
const live = process.argv.includes("--live");
const errors = [];
const warnings = [];

const data = JSON.parse(await fs.readFile(dataPath, "utf8"));

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function parseSeconds(time) {
  if (!/^\d{1,2}:\d{2}(?::\d{2})?$/.test(time)) return null;

  const parts = time.split(":").map(Number);
  const seconds = parts.at(-1);
  const minutes = parts.at(-2);

  if (seconds > 59 || minutes > 59) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

function isPublicYoutubeUrl(value) {
  try {
    const url = new URL(value);
    return ["youtube.com", "www.youtube.com", "youtu.be"].includes(url.hostname);
  } catch {
    return false;
  }
}

function checkPublicDataLeak(session) {
  const serialized = JSON.stringify(session);
  const forbidden = ["/Users/", "raw/", "transcripts/", ".vtt", ".srt", ".mp3", ".mp4", ".m4a", ".wav"];
  for (const token of forbidden) {
    if (serialized.includes(token)) {
      fail(`${session.id}: public data contains private or media token "${token}"`);
    }
  }
}

function checkSession(session, seenIds) {
  if (!session.id) fail("session without id");
  if (seenIds.has(session.id)) fail(`${session.id}: duplicate id`);
  seenIds.add(session.id);

  if (!session.title || session.title.length < 4) fail(`${session.id}: missing title`);
  if (/\s-\s[^-]+,\s?[^-]+$/.test(session.title)) {
    fail(`${session.id}: title still looks like it contains speaker metadata`);
  }
  if (!session.youtubeUrl || !isPublicYoutubeUrl(session.youtubeUrl)) {
    fail(`${session.id}: invalid YouTube URL`);
  }
  if (!session.summaryPath?.startsWith("summaries/") || !session.summaryPath.endsWith(".md")) {
    fail(`${session.id}: invalid summaryPath`);
  }
  if (!session.excerpt || session.excerpt.length < 20) fail(`${session.id}: excerpt is too short`);
  if (!Array.isArray(session.sections) || session.sections.length < 3) {
    fail(`${session.id}: too few parsed sections`);
  }
  if (!Array.isArray(session.topics) || session.topics.length === 0) fail(`${session.id}: missing topics`);
  if (!Number.isInteger(session.relevance) || session.relevance < 1 || session.relevance > 5) {
    fail(`${session.id}: relevance must be an integer from 1 to 5`);
  }

  let previous = -1;
  for (const timestamp of session.timestamps || []) {
    const start = parseSeconds(timestamp.time);
    const end = timestamp.endTime ? parseSeconds(timestamp.endTime) : null;

    if (start === null) fail(`${session.id}: invalid timestamp "${timestamp.time}"`);
    if (start !== null && start < previous) fail(`${session.id}: timestamps are not sorted at ${timestamp.time}`);
    if (start !== null) previous = start;
    if (timestamp.endTime && end === null) fail(`${session.id}: invalid endTime "${timestamp.endTime}"`);
    if (start !== null && end !== null && end <= start) {
      fail(`${session.id}: timestamp range ends before it starts (${timestamp.time}-${timestamp.endTime})`);
    }
    if (!timestamp.label || timestamp.label.length < 4) fail(`${session.id}: empty timestamp label at ${timestamp.time}`);
  }

  if ((session.timestamps || []).length === 0) {
    warn(`${session.id}: no timestamps`);
  }

  checkPublicDataLeak(session);
}

async function readDurationCache() {
  try {
    return JSON.parse(await fs.readFile(cachePath, "utf8"));
  } catch {
    return {};
  }
}

async function writeDurationCache(cache) {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
}

function getYoutubeDuration(url) {
  const output = execFileSync("yt-dlp", ["--dump-json", "--skip-download", "--no-warnings", "--no-playlist", url], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const metadata = JSON.parse(output);
  return metadata.duration;
}

async function checkLiveDurations() {
  const cache = await readDurationCache();
  const uniqueUrls = [...new Set(data.sessions.map((session) => session.youtubeUrl))];

  for (const [index, url] of uniqueUrls.entries()) {
    if (!cache[url]) {
      process.stdout.write(`Checking YouTube duration ${index + 1}/${uniqueUrls.length}\r`);
      cache[url] = getYoutubeDuration(url);
      await writeDurationCache(cache);
    }
  }

  process.stdout.write("\n");
  for (const session of data.sessions) {
    const duration = cache[session.youtubeUrl];
    if (!Number.isFinite(duration)) {
      fail(`${session.id}: could not read YouTube duration`);
      continue;
    }

    for (const timestamp of session.timestamps || []) {
      const start = parseSeconds(timestamp.time);
      const end = timestamp.endTime ? parseSeconds(timestamp.endTime) : start;
      const maxTimestamp = Math.max(start ?? 0, end ?? 0);
      if (maxTimestamp > duration + 3) {
        fail(`${session.id}: timestamp ${timestamp.endTime || timestamp.time} exceeds video duration ${duration}s`);
      }
    }
  }
}

if (!Array.isArray(data.sessions) || data.sessions.length < 80) {
  fail(`expected at least 80 sessions, got ${data.sessions?.length ?? 0}`);
}
if (!data.notice?.includes("только то, что было публично доступно")) {
  fail("notice must clearly say that coverage is limited to publicly available records");
}

const seenIds = new Set();
for (const session of data.sessions || []) {
  checkSession(session, seenIds);
}

if (live) {
  await checkLiveDurations();
}

for (const message of warnings) {
  console.warn(`Warning: ${message}`);
}

if (errors.length) {
  console.error(errors.map((message) => `- ${message}`).join("\n"));
  process.exit(1);
}

console.log(
  `Validated ${data.sessions.length} sessions, ${data.sessions.reduce(
    (sum, session) => sum + session.timestamps.length,
    0,
  )} timestamps${live ? " with live YouTube durations" : ""}.`,
);
