import { useEffect, useMemo, useState } from "react";
import {
  ArrowSquareOut,
  GithubLogo,
  MagnifyingGlass,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import type { Section, Session, SiteData } from "./types";

const tierOrder = ["Must watch", "Worth skimming", "Only if needed", "All summaries"];
const topicLabels: Record<string, string> = {
  "AI agents": "AI agents",
  "Coding agents": "Coding agents",
  "Browser/workflow agents": "Browser / workflow",
  "Tool use": "Tool use",
  "Harness / sandbox": "Harness / sandbox",
  "Evals / reliability / observability": "Evals / reliability",
  "Developer tools": "Developer tools",
  "Product ideas": "Product ideas",
  "Industry direction": "Industry direction",
  Other: "Другое",
};

const tierLabels: Record<string, string> = {
  "Must watch": "Главное",
  "Worth skimming": "Полезное",
  "Only if needed": "Нишевое",
  "All summaries": "Справочно",
};

function sectionText(section?: Section) {
  return section?.body.replace(/\n+/g, "\n").trim() || "";
}

function renderMarkdownLite(text: string) {
  return text.split(/\n+/).map((line, index) => {
    const normalized = line
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");

    if (normalized.startsWith("- ")) {
      return <li key={`${line}-${index}`}>{normalized.slice(2)}</li>;
    }

    return <p key={`${line}-${index}`}>{normalized}</p>;
  });
}

function youtubeWithTime(url: string, time: string) {
  if (!url) return "";
  const parts = time.split(":").map(Number);
  const seconds =
    parts.length === 3 ? parts[0] * 3600 + parts[1] * 60 + parts[2] : parts[0] * 60 + parts[1];
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${seconds}s`;
}

export default function App() {
  const [data, setData] = useState<SiteData | null>(null);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [tier, setTier] = useState("all");
  const [sort, setSort] = useState("priority");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/sessions.json`)
      .then((response) => response.json())
      .then((payload: SiteData) => {
        setData(payload);
        setSelectedId(payload.sessions[0]?.id || null);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const normalizedQuery = query.trim().toLowerCase();

    return data.sessions
      .filter((session) => {
        const haystack = [
          session.title,
          session.speakers,
          session.track,
          session.excerpt,
          session.topics.join(" "),
          session.sections.map((section) => `${section.title} ${section.body}`).join(" "),
        ]
          .join(" ")
          .toLowerCase();

        const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
        const matchesTopic = topic === "all" || session.topics.includes(topic);
        const matchesTier = tier === "all" || session.watchTier === tier;
        return matchesQuery && matchesTopic && matchesTier;
      })
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "relevance") return b.relevance - a.relevance || a.title.localeCompare(b.title);
        return (
          tierOrder.indexOf(a.watchTier) - tierOrder.indexOf(b.watchTier) ||
          b.relevance - a.relevance ||
          a.title.localeCompare(b.title)
        );
      });
  }, [data, query, sort, tier, topic]);

  const selected = useMemo(() => {
    if (!data) return null;
    return filtered.find((session) => session.id === selectedId) || filtered[0] || null;
  }, [data, filtered, selectedId]);

  if (!data) {
    return (
      <main className="loading-shell">
        <div className="loading-card">
          <span />
          <p>Загружаю навигатор</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <nav className="topbar" aria-label="Основная навигация">
          <a className="brand" href="/">
            AI Engineer WF2026 RU
          </a>
          <div className="nav-links">
            <a
              href="https://github.com/xonika9/ai-engineer-worlds-fair-2026-ru"
              target="_blank"
              rel="noreferrer"
            >
              <GithubLogo size={18} weight="bold" />
              GitHub
            </a>
            <a href="https://www.youtube.com/@aiDotEngineer" target="_blank" rel="noreferrer">
              <ArrowSquareOut size={18} weight="bold" />
              YouTube
            </a>
          </div>
        </nav>

        <section className="hero-grid">
          <div>
            <p className="kicker">Русскоязычный навигатор</p>
            <h1>AI Engineer World's Fair 2026 без восьмичасового просмотра вслепую</h1>
            <p className="lead">
              Поиск, темы, саммари и таймкоды по публично доступным записям конференции.
            </p>
          </div>

          <div className="status-panel" aria-label="Статус обработки">
            <p>{data.notice}</p>
            <dl>
              <div>
                <dt>{data.stats.summaries}</dt>
                <dd>саммари</dd>
              </div>
              <div>
                <dt>{data.stats.longStreamSegments}</dt>
                <dd>сегментов</dd>
              </div>
              <div>
                <dt>{data.stats.missing}</dt>
                <dd>ещё не найдено</dd>
              </div>
            </dl>
          </div>
        </section>
      </header>

      <section className="workspace">
        <aside className="filters" aria-label="Фильтры">
          <div className="searchbox">
            <MagnifyingGlass size={19} weight="bold" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск: sandbox, browser, evals..."
              aria-label="Поиск по докладам"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск">
                <X size={16} weight="bold" />
              </button>
            )}
          </div>

          <div className="filter-group">
            <div className="filter-title">
              <SlidersHorizontal size={17} weight="bold" />
              Приоритет
            </div>
            <div className="chips">
              {["all", ...tierOrder.slice(0, 3)].map((value) => (
                <button
                  className={tier === value ? "chip active" : "chip"}
                  key={value}
                  type="button"
                  onClick={() => setTier(value)}
                >
                  {value === "all" ? "Все" : tierLabels[value] || value}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <div className="filter-title">Темы</div>
            <div className="chips">
              <button
                className={topic === "all" ? "chip active" : "chip"}
                type="button"
                onClick={() => setTopic("all")}
              >
                Все темы
              </button>
              {data.topics.map((item) => (
                <button
                  className={topic === item.id ? "chip active" : "chip"}
                  key={item.id}
                  type="button"
                  onClick={() => setTopic(item.id)}
                >
                  {topicLabels[item.label] || item.label}
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
          </div>

          <label className="select-label">
            Сортировка
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="priority">По приоритету</option>
              <option value="relevance">По релевантности</option>
              <option value="title">По названию</option>
            </select>
          </label>
        </aside>

        <section className="results" aria-label="Доклады">
          <div className="results-head">
            <div>
              <strong>{filtered.length}</strong>
              <span>из {data.sessions.length} саммари</span>
            </div>
            <a
              href="https://github.com/xonika9/ai-engineer-worlds-fair-2026-ru/blob/main/missing-sessions.md"
              target="_blank"
              rel="noreferrer"
            >
              missing sessions
            </a>
          </div>

          <div className="cards">
            {filtered.map((session) => (
              <button
                className={selected?.id === session.id ? "session-card active" : "session-card"}
                key={session.id}
                type="button"
                onClick={() => setSelectedId(session.id)}
              >
                <span className="tier">{tierLabels[session.watchTier] || session.watchTier}</span>
                <h2>{session.title}</h2>
                <p>{session.excerpt}</p>
                <div className="card-meta">
                  <span>{session.track}</span>
                  <span>приоритет {session.relevance}/5</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <article className="detail" aria-live="polite">
          {selected ? (
            <>
              <div className="detail-head">
                <span className="tier">{tierLabels[selected.watchTier] || selected.watchTier}</span>
                <h2>{selected.title}</h2>
                <p>{selected.speakers || "Спикеры не указаны"}</p>
                <div className="detail-actions">
                  <a href={selected.youtubeUrl} target="_blank" rel="noreferrer">
                    <ArrowSquareOut size={18} weight="bold" />
                    Видео
                  </a>
                  <a
                    href={`https://github.com/xonika9/ai-engineer-worlds-fair-2026-ru/blob/main/${selected.summaryPath}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GithubLogo size={18} weight="bold" />
                    Саммари
                  </a>
                </div>
              </div>

              <div className="topic-row">
                {selected.topics.map((item) => (
                  <span key={item}>{topicLabels[item] || item}</span>
                ))}
              </div>

              <SummaryBlock title="Коротко" text={selected.excerpt} />
              <SummaryBlock
                title="Главные идеи"
                text={sectionText(selected.sections.find((section) => /главные идеи/i.test(section.title)))}
              />
              <SummaryBlock
                title="Практически полезно"
                text={sectionText(
                  selected.sections.find((section) => /практические|полезно|применить/i.test(section.title)),
                )}
              />

              {selected.timestamps.length > 0 && (
                <section className="timestamps">
                  <h3>Таймкоды</h3>
                  {selected.timestamps.slice(0, 8).map((timestamp) => (
                    <a
                      href={youtubeWithTime(selected.youtubeUrl, timestamp.time)}
                      target="_blank"
                      rel="noreferrer"
                      key={`${selected.id}-${timestamp.time}-${timestamp.label}`}
                    >
                      <strong>{timestamp.time}</strong>
                      <span>{timestamp.label}</span>
                    </a>
                  ))}
                </section>
              )}
            </>
          ) : (
            <div className="empty-state">Ничего не найдено. Попробуй другой запрос или тему.</div>
          )}
        </article>
      </section>
    </main>
  );
}

function SummaryBlock({ title, text }: { title: string; text: string }) {
  if (!text) return null;

  return (
    <section className="summary-block">
      <h3>{title}</h3>
      <div>{renderMarkdownLite(text)}</div>
    </section>
  );
}
