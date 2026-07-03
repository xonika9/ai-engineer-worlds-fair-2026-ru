import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const outputDir = path.resolve(repoRoot, "site/public/data");

const topicRules = [
  ["AI agents", /agent|агент/i],
  ["Coding agents", /coding agent|код|swe|review debt|spec-driven/i],
  ["Browser/workflow agents", /browser|workflow|web|office|document|voice/i],
  ["Tool use", /tool|инструмент|mcp|retrieval|rag/i],
  ["Harness / sandbox", /harness|sandbox|песочниц|record\/replay|save button/i],
  ["Evals / reliability / observability", /eval|reliab|observ|debug|failure|prod|галлюцинац|monitor/i],
  ["Developer tools", /developer|sdk|ci\/cd|typescript|terminal|tools/i],
  ["Product ideas", /product|gtm|startup|ux|buyer|vertical/i],
  ["Industry direction", /future|platform|systems|factory|paradigm|индустр/i],
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records
    .filter((record) => record.some(Boolean))
    .map((record) =>
      Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ""])),
    );
}

function slugFromPath(summaryPath) {
  return path.basename(summaryPath, ".md");
}

function stripMarkdown(value) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSummary(markdown, fallback) {
  const lines = markdown.split(/\r?\n/);
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^# /, "").trim() || fallback.title;
  const sections = [];
  let current = null;

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(?:\d+\.\s*)?(.+)$/);
    if (sectionMatch) {
      current = { title: sectionMatch[1].trim(), body: "" };
      sections.push(current);
    } else if (current) {
      current.body += `${line}\n`;
    }
  }

  const videoMatch = markdown.match(/- Видео:\s+\[YouTube\]\(([^)]+)\)/);
  const timestampLines = markdown
    .split(/\r?\n/)
    .filter((line) => /^-\s+\d+:\d{2}/.test(line.trim()))
    .map((line) => {
      const cleaned = line.replace(/^-\s+/, "").trim();
      const match = cleaned.match(/^([0-9:]+)\s+[—-]\s+(.+)$/);
      return match ? { time: match[1], label: match[2] } : { time: cleaned, label: "" };
    });

  const usefulSection =
    sections.find((section) => /полезно|применить/i.test(section.title)) || sections[0];
  const excerpt = stripMarkdown(usefulSection?.body || sections[0]?.body || "").slice(0, 280);

  return {
    title,
    youtubeUrl: videoMatch?.[1] || fallback.youtube_url,
    sections: sections.map((section) => ({
      title: section.title,
      body: section.body.trim(),
    })),
    excerpt,
    timestamps: timestampLines,
  };
}

function inferTopics(session) {
  const haystack = [
    session.title,
    session.track,
    session.excerpt,
    session.sections.map((section) => `${section.title} ${section.body}`).join(" "),
  ].join(" ");

  const topics = topicRules
    .filter(([, rule]) => rule.test(haystack))
    .map(([topic]) => topic);

  return topics.length ? topics : ["Industry direction"];
}

function parseWatchlist(markdown) {
  const tiers = new Map();
  let current = "";

  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      current = heading[1].trim();
      continue;
    }

    const link = line.match(/^- \[([^\]]+)\]\(([^)]+)\)/);
    if (link && current) {
      tiers.set(link[2].split("&")[0], current);
      tiers.set(link[1], current);
    }
  }

  return tiers;
}

const manifest = parseCsv(await fs.readFile(path.resolve(repoRoot, "manifest.csv"), "utf8"));
const watchTiers = parseWatchlist(await fs.readFile(path.resolve(repoRoot, "watchlist.md"), "utf8"));

const summaryRows = [
  ...new Map(
    manifest.filter((row) => row.summary_path).map((row) => [row.summary_path, row]),
  ).values(),
];
const sessions = [];

for (const row of summaryRows) {
  const summaryPath = path.resolve(repoRoot, row.summary_path);
  const markdown = await fs.readFile(summaryPath, "utf8");
  const parsed = parseSummary(markdown, row);
  const id = slugFromPath(row.summary_path);
  const watchTier =
    watchTiers.get(row.youtube_url) || watchTiers.get(row.title) || "All summaries";

  const session = {
    id,
    title: parsed.title,
    speakers: row.speakers,
    track: row.track || "Online Track",
    youtubeUrl: parsed.youtubeUrl || row.youtube_url,
    sourceUrl: row.source_url,
    status: row.status,
    relevance: Number(row.relevance || 0),
    summaryPath: row.summary_path,
    watchTier,
    excerpt: parsed.excerpt,
    sections: parsed.sections,
    timestamps: parsed.timestamps,
  };
  session.topics = inferTopics(session);
  sessions.push(session);
}

const topics = topicRules.map(([topic]) => ({
  id: topic,
  label: topic,
  count: sessions.filter((session) => session.topics.includes(topic)).length,
}));

const statusCounts = manifest.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});
const uniqueLongStreamSegments = new Set(
  manifest
    .filter((row) => row.status === "found_in_long_stream")
    .map((row) => row.title),
).size;

const data = {
  notice:
    "Обработано только то, что было публично доступно на YouTube на момент сбора, а не все выступления конференции.",
  stats: {
    manifestRows: manifest.length,
    summaries: sessions.length,
    processedYoutube: statusCounts.summarized || 0,
    duplicates: statusCounts.duplicate || 0,
    unavailable: statusCounts.unavailable || 0,
    missing: statusCounts.missing || 0,
    longStreamSegments: uniqueLongStreamSegments,
  },
  topics,
  sessions,
};

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(
  path.resolve(outputDir, "sessions.json"),
  `${JSON.stringify(data, null, 2)}\n`,
);

console.log(`Built ${sessions.length} public summaries into site/public/data/sessions.json`);
