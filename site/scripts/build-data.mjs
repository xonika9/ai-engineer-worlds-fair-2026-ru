import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");
const outputDir = path.resolve(repoRoot, "site/public/data");

const topicRules = [
  ["AI agents", /agent|агент/i],
  ["Coding agents", /coding agent|coding agents|swe-marathon|review debt|spec-driven|кодинг/i],
  ["Browser/workflow agents", /browser|браузер|workflow|office|document|voice|голос/i],
  ["Tool use", /tool use|tool call|tool execution|инструмент(?:ы|ов)? выполнения|mcp|retrieval|rag/i],
  ["Harness / sandbox", /harness|харнес|sandbox|песочниц|record\/replay|save button|state machine|scaffolding/i],
  ["Evals / reliability / observability", /eval|reliab|observ|наблюдаем|debug|failure|prod|галлюцинац|monitor|latency/i],
  ["Developer tools", /developer tools|devtools|sdk|ci\/cd|terminal|ide|инструмент(?:ы|ов)? разработ/i],
  ["Product ideas", /product|gtm|startup|ux|buyer|vertical/i],
  ["Industry direction", /future|platform|systems|factory|paradigm|индустр/i],
  ["Other", /.+/i],
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
    .replace(/^\s*[-*]\s+/gm, "")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseSummary(markdown, fallback) {
  const lines = markdown.split(/\r?\n/);
  const rawTitle = lines.find((line) => line.startsWith("# "))?.replace(/^# /, "").trim() || fallback.title;
  const metaSpeakers =
    markdown.match(/^- Спикеры:\s+(.+)$/m)?.[1]?.trim() || fallback.speakers || "";
  const { title, speakers } = normalizeTitleAndSpeakers(rawTitle, metaSpeakers);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const sectionTitle = getSectionTitle(line);
    if (sectionTitle) {
      current = { title: sectionTitle, body: "" };
      sections.push(current);
    } else if (current) {
      current.body += `${line}\n`;
    }
  }

  const videoMatch = markdown.match(/- Видео:\s+\[YouTube\]\(([^)]+)\)/);
  const timestampLines = markdown
    .split(/\r?\n/)
    .map(parseTimestampLine)
    .filter(Boolean);

  const usefulSection =
    sections.find((section) => /полезно|применить/i.test(section.title)) || sections[0];
  const excerpt = stripMarkdown(usefulSection?.body || sections[0]?.body || "").slice(0, 280);

  return {
    title,
    speakers,
    youtubeUrl: videoMatch?.[1] || fallback.youtube_url,
    sections: sections.map((section) => ({
      title: section.title,
      body: section.body.trim(),
    })),
    excerpt,
    timestamps: timestampLines,
  };
}

function parseTimestampLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("- ")) return null;

  const cleaned = trimmed
    .replace(/^-\s+/, "")
    .replace(/^\*\*([^*]+)\*\*/, "$1")
    .trim();
  const match = cleaned.match(
    /^\[?(\d{1,2}:\d{2}(?::\d{2})?)(?:\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?))?\]?\s*(?:[-–—:]\s*)?(.+)?$/,
  );
  if (!match) return null;

  const [, time, endTime, rawLabel = ""] = match;
  const label = rawLabel.replace(/\*\*/g, "").trim();

  return {
    time,
    ...(endTime ? { endTime } : {}),
    label,
  };
}

function getSectionTitle(line) {
  const markdownHeading = line.match(/^#{2,3}\s+(?:\d+\.\s*)?(.+)$/);
  if (markdownHeading) {
    return markdownHeading[1].trim().replace(/^\*\*(.+)\*\*$/, "$1");
  }

  const numberedHeading = line.trim().match(/^([1-9])\.\s+\**(.+?)\**\s*$/);
  if (!numberedHeading) return "";

  const title = numberedHeading[2].replace(/\*\*/g, "").trim();
  return /^(О ч[её]м доклад|Главные идеи|Практические выводы|Упомянутые|Что полезно|Что можно применить|Возможная идея|Стоит ли смотреть|Самые важные таймкоды)/i.test(
    title,
  )
    ? title
    : "";
}

function normalizeTitleAndSpeakers(rawTitle, rawSpeakers) {
  const speakersAreMissing = !rawSpeakers || /не указаны/i.test(rawSpeakers);
  const separatorIndex = rawTitle.lastIndexOf(" - ");

  if (speakersAreMissing && separatorIndex > 0) {
    const title = rawTitle.slice(0, separatorIndex).trim();
    const speakers = rawTitle.slice(separatorIndex + 3).trim();

    if (title && speakers) {
      return { title, speakers };
    }
  }

  return { title: rawTitle, speakers: speakersAreMissing ? "" : rawSpeakers };
}

function inferTopics(session) {
  const contentSections = session.sections.filter((section) =>
    /о ч[её]м|главные идеи|практические выводы|упомянутые/i.test(section.title),
  );
  const positiveText = [
    session.title,
    session.track,
    contentSections.map((section) => section.body).join(" "),
  ].join(" ");
  const usefulness = session.sections
    .filter((section) => /полезно|применить/i.test(section.title))
    .map((section) => section.body)
    .join(" ");
  const usefulnessIsNegative = /не затрагивает|прямых (?:упоминаний|привязок).*нет|конкретных упоминаний.*нет|не относится/i.test(
    usefulness,
  );
  const haystack = usefulnessIsNegative ? positiveText : `${positiveText} ${usefulness}`;

  const topics = topicRules
    .filter(([topic, rule]) => topic !== "Other" && rule.test(haystack))
    .map(([topic]) => topic);

  return topics.length ? topics : ["Other"];
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

function relevanceForTier(tier, fallback) {
  if (tier === "Must watch") return 5;
  if (tier === "Worth skimming") return 4;
  if (tier === "Only if needed") return 2;
  if (/skip/i.test(tier)) return 1;
  return Number(fallback || 3);
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
    speakers: parsed.speakers,
    track: row.track || "Online Track",
    youtubeUrl: parsed.youtubeUrl || row.youtube_url,
    sourceUrl: row.source_url,
    status: row.status,
    relevance: relevanceForTier(watchTier, row.relevance),
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
