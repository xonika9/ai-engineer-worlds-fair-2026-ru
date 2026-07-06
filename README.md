# AI Engineer World's Fair 2026 RU

Русскоязычный навигатор по AI Engineer World's Fair 2026: саммари докладов, тематическая карта, список того, что стоит смотреть, и ссылки на оригинальные видео с таймкодами.

AI Engineer World's Fair 2026 — конференция про практическую AI-инженерию: агентные системы, coding agents, harness engineering, evals, наблюдаемость, инструменты разработчика, продакшен и продуктовые сценарии вокруг современных моделей.

Веб-версия навигатора: https://xonika9.github.io/ai-engineer-worlds-fair-2026-ru/

Telegram-канал: [Контролируемые галлюцинации](https://t.me/+Rd60cz14OZI3OGMy)

## Что внутри

- [watchlist.md](watchlist.md) — с чего начать и что можно пропустить.
- [topic-map.md](topic-map.md) — тематическая карта по агентам, tool use, sandbox, evals и developer tools.
- [highlights.md](highlights.md) — самые интересные тезисы с источниками и таймкодами.
- [summaries/](summaries/) — русские саммари обработанных видео.
- [manifest.csv](manifest.csv) — публичный реестр сессий без локальных путей и служебных полей.
- [missing-sessions.md](missing-sessions.md) — сессии, для которых публичные записи пока не найдены.
- [sources.md](sources.md) — официальные источники и метод сбора.

## Статус

- Обработано только то, что было публично доступно на YouTube на момент сбора, а не все выступления конференции.
- Обработано уникальных YouTube-видео: 348.
- Доступно саммари: 348.
- Найдено сегментов в длинных трансляциях: 55.
- Сессий из официального расписания пока не найдено как отдельные видео или обоснованные сегменты: 491.

## Как пользоваться

Если времени мало, начни с [watchlist.md](watchlist.md). Если ищешь доклады под конкретную задачу, открой [topic-map.md](topic-map.md). Если нужен общий срез конференции, прочитай [highlights.md](highlights.md), а затем переходи в отдельные саммари. Для проверки покрытия и статусов есть [manifest.csv](manifest.csv).

## Топ-10 докладов для старта

1. [Browser Agents Don't Need Better Models. They Need Better Eyes. - Kushan Raj, ARK](https://www.youtube.com/watch?v=JnubYCYunk8&t=56s) — Kushan Raj, ARK; таймкод: 0:00:56. Лучший короткий вход в тему браузерных агентов: среда, сжатое представление страницы, диффы и обратная связь важнее гонки моделей.
2. [Your Agent Failed in Prod. Good Luck Reproducing It. - Tisha Chawla & Susheem Koul, Microsoft](https://www.youtube.com/watch?v=Lc8zRh9muoY&t=442s) — Tisha Chawla & Susheem Koul, Microsoft; таймкод: 0:07:22. Практичный доклад про record/replay: как воспроизводить сбои агента без надежды на магический `temperature=0`.
3. [The 100-Tool Agent Is a Trap - Sohail Shaikh & Ankush Rastogi, Prosodica](https://www.youtube.com/watch?v=vh2VGuQ3zhY&t=263s) — Sohail Shaikh & Ankush Rastogi, Prosodica; таймкод: 0:04:23. Хорошая рамка для tool use: semantic routing и подгрузка контекста по необходимости вместо передачи сотни инструментов сразу.
4. [What if the harness mattered more than the model? - Aditya Bhargava, Etsy](https://www.youtube.com/watch?v=2e9ANoOEn28&t=0s) — Aditya Bhargava, Etsy; таймкод: 0:00:00. Сильный тезис конференции: качество агентной системы часто определяется оснасткой, а не только выбранной моделью.
5. [SWE-Marathon: Evaluating Coding Agents at Billion-Token Scale - Rishi Desai, Abundant AI](https://www.youtube.com/watch?v=Rx8f05JI_WA&t=0s) — Rishi Desai, Abundant AI; таймкод: 0:00:00. Полезно для всех, кто оценивает coding agents: масштаб, длинные задачи и ограничения привычных бенчмарков.
6. [Skills are the New SDKs - Elvin Aghammadzada, DataRobot](https://www.youtube.com/watch?v=LC3-P7v3yoI&t=780s) — Elvin Aghammadzada, DataRobot; таймкод: 0:13:00. Навыки показаны как переносимый слой разработки агентных продуктов: версионирование, тесты, каталог и исполнение.
7. [The Log Is The Agent - Ishaan Sehgal, Omnara](https://www.youtube.com/watch?v=UPwGaM2MKHY&t=0s) — Ishaan Sehgal, Omnara; таймкод: 0:00:00. Очень прикладная идея: журнал событий становится основой состояния, наблюдаемости и восстановления работы агента.
8. [User Signal Dies at the Retrieval Boundary - Sonam Pankaj, StarlightSearch](https://www.youtube.com/watch?v=Jx4ZFEAq6bY&t=136s) — Sonam Pankaj, StarlightSearch; таймкод: 0:02:16. Показывает, почему оценки и пользовательский сигнал должны доходить до retrieval-слоя, иначе система не учится на ошибках.
9. [Your Coding Agent Is Creating Review Debt - Sachin Gupta](https://www.youtube.com/watch?v=TJPInBjhE4Q&t=286s) — Sachin Gupta; таймкод: 0:04:46. Хороший антихайповый доклад: код генерируется быстрее, чем команда успевает понять и проверить изменения.
10. [Agent Output Is Not UX: Rendering Layer Your LLM Pipeline Is Missing - Bala Ramdoss, Amazon](https://www.youtube.com/watch?v=maTp79FD9gI&t=0s) — Bala Ramdoss, Amazon; таймкод: 0:00:00. Напоминание, что AI-продукту нужен слой отрисовки и взаимодействия, а не просто текстовый ответ модели.

## Официальные ссылки

- [YouTube-канал AI Engineer](https://www.youtube.com/@aiDotEngineer)
- [AI Engineer World's Fair Online Track 2026](https://www.youtube.com/playlist?list=PLcfpQ4tk2k0V1LNigteMgExP1rb4Hy8wn)
- [Официальное расписание AI Engineer World's Fair](https://www.ai.engineer/worldsfair/schedule)

## Обратная связь

Нашли ошибку — неверный таймкод, неточность в саммари или битую ссылку — заведите [issue](https://github.com/xonika9/ai-engineer-worlds-fair-2026-ru/issues). Туда же можно написать про доклад, которого пока нет, или предложить правку.

## Дисклеймер

Это неофициальный русскоязычный проект. Он не связан с AI Engineer, организаторами конференции, спикерами или их компаниями. Оригинальные выступления, видео, слайды и материалы принадлежат их авторам и организаторам.

В репозитории публикуются только русские саммари, навигация, тематические подборки, ссылки и таймкоды. Полные расшифровки, скачанные видео, аудио, субтитры и большие сырые дампы не публикуются.

## Лицензия

Текстовые саммари, навигация и аналитические материалы этого репозитория распространяются по лицензии CC BY-NC 4.0. Лицензия не относится к оригинальным выступлениям, видео, слайдам и другим материалам конференции.
