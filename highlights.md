# Highlights

Тезисы ниже основаны только на обработанных видео и найденных сегментах длинных трансляций. Формулировки пересказаны своими словами; полные расшифровки не публикуются.

## Агентные системы

- Агент полезнее рассматривать как систему исполнения: состояние, журнал, разрешения, повторные попытки, воспроизведение и проверки. Источники: [The Log Is The Agent](https://www.youtube.com/watch?v=UPwGaM2MKHY&t=0s), [Your Agent Failed in Prod](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=452s), [Deterministic Infra](https://www.youtube.com/watch?v=APh1Vx0oLmQ&t=0s).
- Один из главных архитектурных сдвигов — отделять задачу от модели и держать исполнение в отдельном контролируемом слое. Источник: [The Unreasonable Effectiveness of Separating the Task from the Model](https://www.youtube.com/watch?v=I2cbIws9j10&t=2400s).
- Безопасный агент должен уметь остановиться и передать решение человеку; эскалация — часть системы, а не признак провала. Источник: [Using RL Agent to Detect and Remediate ETL Pipeline Failures](https://www.youtube.com/watch?v=LrGCT7G_rU8&t=622s).
- Практичный агент начинается не с “больше автономности”, а с выбора самого простого workflow, понятных границ и проверки результата. Источники: [How We Build Effective Agents](https://www.youtube.com/watch?v=D7_ipDqhtwk&t=23s), [The Agent Development Life Cycle](https://www.youtube.com/watch?v=0vBKv9yAQi4&t=0s).

## Browser, office, document agents

- Браузерным агентам нужны не только скриншоты, а компактное структурное представление страницы, диффы и объяснение неудачных действий. Источник: [Browser Agents Don't Need Better Models](https://www.youtube.com/watch?v=JnubYCYunk8&t=208s).
- Документные агенты должны видеть связи между файлами, а не только текст одного документа. Источник: [AI-Driven Multi-Document Correlation](https://www.youtube.com/watch?v=Iwe_RY-fYgI&t=121s).
- AI-продуктам с файлами нужны управляемые сценарии, источники, боковые панели, отмена действий и контроль изменений. Источник: [The UX of AI](https://www.youtube.com/watch?v=L3RuP_q8Bwc&t=634s).
- Браузер становится не только интерфейсом для человека, но и полноценной средой действия агента: с инструментами наблюдения, отладки и безопасного исполнения. Источники: [The Web Browser Is All You Need](https://www.youtube.com/watch?v=YRGjll7uu5w&t=0s), [Building Agent Interfaces](https://www.youtube.com/watch?v=_B4Pv9ttFgY&t=211s), [Introducing WebMCP](https://www.youtube.com/watch?v=LMbeDEQO6QM&t=357s).

## Tool use, harness, sandbox

- Большой набор инструментов ухудшает работу агента; лучше использовать semantic router и подгружать нужный контекст по требованию. Источник: [The 100-Tool Agent Is a Trap](https://www.youtube.com/watch?v=vh2VGuQ3zhY&t=263s).
- Навыки становятся новым SDK: их нужно индексировать, версионировать, тестировать и исполнять в контролируемой среде. Источник: [Skills are the New SDKs](https://www.youtube.com/watch?v=LC3-P7v3yoI&t=780s).
- Агентам нужны проверяемые следы результата, а не только журнал вызова инструмента. Источник: [Agents Need Receipts](https://www.youtube.com/watch?v=Q9ycQHbDdJs&t=1s).
- Выполнение Bash агентом полезно только при изоляции, журналировании и понятном праве остановки. Источник: [We let an AI agent execute Bash and lived to talk about it](https://www.youtube.com/watch?v=I2cbIws9j10&t=19500s).
- Песочница превращается в центральный продуктовый слой: агенту дают компьютер, но ограничивают сеть, файлы, команды и воспроизводимость. Источники: [Arrakis](https://www.youtube.com/watch?v=wsFd22SL1s8&t=55s), [Give Your Agent a Computer](https://www.youtube.com/watch?v=wflNENRSUb4&t=75s), [OpenAI on Securing Code-Executing AI Agents](https://www.youtube.com/watch?v=w7IMuYsBNr8&t=53s).
- MCP быстро взрослеет, но пока несёт с собой новые проблемы: remote servers, auth, наблюдаемость, безопасность и слишком большой контекст. Источники: [Remote MCPs](https://www.youtube.com/watch?v=0NHCyq8bBcM&t=62s), [MCP Is Not Good Yet](https://www.youtube.com/watch?v=FCi4jT86gSw&t=115s), [The State of MCP observability](https://www.youtube.com/watch?v=Lcqat4iP_lE&t=64s).

## Evals, reliability, observability

- Record/replay становится базовым паттерном: записать прогон агента, стаббить модельные узлы и заново прогонять инструменты. Источники: [запись трассы](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=442s), [replay-тестирование](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=662s).
- Evals должны измерять сценарии и исходы: завершение задачи, успех инструментов, эскалации, нарушения безопасности, задержку, стоимость и восстановление. Источник: [Production Evals](https://www.youtube.com/watch?v=vljxQZfJ9wY&t=101s).
- Если сигнал пользователя не доходит до retrieval, система видит ошибки, но не учится на них. Источник: [User Signal Dies at the Retrieval Boundary](https://www.youtube.com/watch?v=Jx4ZFEAq6bY&t=136s).
- Coding agents создают новый риск: review debt, когда код появляется быстрее, чем команда успевает понять и проверить изменения. Источник: [Your Coding Agent Is Creating Review Debt](https://www.youtube.com/watch?v=TJPInBjhE4Q&t=286s).
- Evals для агентов всё сильнее отходят от статичных тестов: нужны трассы, сценарии, datasets из реальных отказов и проверки, которые меняются вместе с системой. Источники: [Ship Real Agents](https://www.youtube.com/watch?v=Xfl50508LZM&t=324s), [Malleable Evals](https://www.youtube.com/watch?v=4VhbYlfC7Gs&t=94s), [The Future of Evals](https://www.youtube.com/watch?v=MC55hdWLq4o&t=0s).

## Developer tools

- MCP, CLI и skills становятся конкурирующими интерфейсами между моделью, пользователем и средой исполнения. Источник: [MCPs, CLIs, and Skills](https://www.youtube.com/watch?v=I2cbIws9j10&t=7800s).
- MCP Apps показывают направление, где чат становится оболочкой приложения, а интерфейс инструмента живёт в изолированной области. Источник: [MCP Apps](https://www.youtube.com/watch?v=sAOBXCDiDOs&t=361s).
- Локальные индексы кода и наблюдаемость токенов дают прямую экономию для coding agents. Источники: [We Cut 94% of AI Coding Tokens With a Local Code Index](https://www.youtube.com/watch?v=dRmWYHuIJxM&t=393s), [Your Agent Is Wasting Tokens](https://www.youtube.com/watch?v=uiP88SpCi1Q&t=18s).
- Codex и Claude Code показывают, что coding agent становится многоповерхностным продуктом: CLI, IDE, web, Slack, review, sub-agents и SDK. Источники: [OpenAI Codex Masterclass](https://www.youtube.com/watch?v=MhHEGMFCEB0&t=14s), [Claude Code](https://www.youtube.com/watch?v=Lue8K2jqfKk&t=56s), [Claude Agent SDK](https://www.youtube.com/watch?v=TqC1qOfiVcQ&t=241s).
- Главный сдвиг в разработке — не “ИИ пишет код”, а “человек планирует и ревьюит, агент выполняет длинные куски работы”. Источники: [Software Engineering Is Becoming Plan and Review](https://www.youtube.com/watch?v=W76woOYHlvY&t=106s), [Workflow for AI Coding](https://www.youtube.com/watch?v=-QFHIoCo-Ko&t=180s).
