# Highlights

Тезисы ниже основаны только на обработанных видео и найденных сегментах длинных трансляций. Формулировки пересказаны своими словами; полные расшифровки не публикуются.

## Агентные системы

- Агент полезнее рассматривать как систему исполнения: состояние, журнал, разрешения, повторные попытки, воспроизведение и проверки. Источники: [The Log Is The Agent](https://www.youtube.com/watch?v=UPwGaM2MKHY&t=0s), [Your Agent Failed in Prod](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=452s), [Deterministic Infra](https://www.youtube.com/watch?v=APh1Vx0oLmQ&t=0s).
- Один из главных архитектурных сдвигов — отделять задачу от модели и держать исполнение в отдельном контролируемом слое. Источник: [The Unreasonable Effectiveness of Separating the Task from the Model](https://www.youtube.com/watch?v=I2cbIws9j10&t=2400s).
- Безопасный агент должен уметь остановиться и передать решение человеку; эскалация — часть системы, а не признак провала. Источник: [Using RL Agent to Detect and Remediate ETL Pipeline Failures](https://www.youtube.com/watch?v=LrGCT7G_rU8&t=622s).

## Browser, office, document agents

- Браузерным агентам нужны не только скриншоты, а компактное структурное представление страницы, диффы и объяснение неудачных действий. Источник: [Browser Agents Don't Need Better Models](https://www.youtube.com/watch?v=JnubYCYunk8&t=208s).
- Документные агенты должны видеть связи между файлами, а не только текст одного документа. Источник: [AI-Driven Multi-Document Correlation](https://www.youtube.com/watch?v=Iwe_RY-fYgI&t=121s).
- AI-продуктам с файлами нужны управляемые сценарии, источники, боковые панели, отмена действий и контроль изменений. Источник: [The UX of AI](https://www.youtube.com/watch?v=L3RuP_q8Bwc&t=634s).

## Tool use, harness, sandbox

- Большой набор инструментов ухудшает работу агента; лучше использовать semantic router и подгружать нужный контекст по требованию. Источник: [The 100-Tool Agent Is a Trap](https://www.youtube.com/watch?v=vh2VGuQ3zhY&t=263s).
- Навыки становятся новым SDK: их нужно индексировать, версионировать, тестировать и исполнять в контролируемой среде. Источник: [Skills are the New SDKs](https://www.youtube.com/watch?v=LC3-P7v3yoI&t=780s).
- Агентам нужны проверяемые следы результата, а не только журнал вызова инструмента. Источник: [Agents Need Receipts](https://www.youtube.com/watch?v=Fu45geO3zX8&t=1s).
- Выполнение Bash агентом полезно только при изоляции, журналировании и понятном праве остановки. Источник: [We let an AI agent execute Bash and lived to talk about it](https://www.youtube.com/watch?v=I2cbIws9j10&t=19500s).

## Evals, reliability, observability

- Record/replay становится базовым паттерном: записать прогон агента, стаббить модельные узлы и заново прогонять инструменты. Источники: [запись трассы](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=442s), [replay-тестирование](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=662s).
- Evals должны измерять сценарии и исходы: завершение задачи, успех инструментов, эскалации, нарушения безопасности, задержку, стоимость и восстановление. Источник: [Production Evals](https://www.youtube.com/watch?v=vljxQZfJ9wY&t=101s).
- Если сигнал пользователя не доходит до retrieval, система видит ошибки, но не учится на них. Источник: [User Signal Dies at the Retrieval Boundary](https://www.youtube.com/watch?v=Jx4ZFEAq6bY&t=136s).
- Coding agents создают новый риск: review debt, когда код появляется быстрее, чем команда успевает понять и проверить изменения. Источник: [Your Coding Agent Is Creating Review Debt](https://www.youtube.com/watch?v=TJPInBjhE4Q&t=286s).

## Developer tools

- MCP, CLI и skills становятся конкурирующими интерфейсами между моделью, пользователем и средой исполнения. Источник: [MCPs, CLIs, and Skills](https://www.youtube.com/watch?v=I2cbIws9j10&t=7800s).
- MCP Apps показывают направление, где чат становится оболочкой приложения, а интерфейс инструмента живёт в изолированной области. Источник: [MCP Apps](https://www.youtube.com/watch?v=sAOBXCDiDOs&t=361s).
- Локальные индексы кода и наблюдаемость токенов дают прямую экономию для coding agents. Источники: [We Cut 94% of AI Coding Tokens With a Local Code Index](https://www.youtube.com/watch?v=dRmWYHuIJxM&t=393s), [Your Agent Is Wasting Tokens](https://www.youtube.com/watch?v=uiP88SpCi1Q&t=18s).
