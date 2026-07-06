# Self-Training Agents: Hermes Agent, HF Traces, Skills, MCP & Finetuning

- Спикеры: Merve Noyan, Hugging Face
- Трек: Open Models @ AI Engineer
- Видео: [YouTube](https://www.youtube.com/watch?v=OV56RddyFuU)
- Официальный источник: [расписание AI Engineer World's Fair](https://www.ai.engineer/worldsfair/schedule)
- Статус обработки: summarized

> Это русскоязычное саммари. Полные расшифровки и медиафайлы здесь не публикуются.

## 1. О чём доклад
Обзор экосистемы открытых agentic-моделей и инструментов Hugging Face, которые делают локальную разработку, файнтюнинг и деплой AI-агентов доступными — от выбора модели до запуска сложных пайплайнов через навыки и MCP.

## 2. Главные идеи
- Открытые модели догнали и обгоняют закрытые по качеству, особенно новые VLM (GLM 5.1, Qwen 3.5, Chimera 2.5), которые с первого дня выходят с vision-возможностями.
- Локальный запуск агентов стал тривиальным: llama.cpp, Ollama, LM Studio, MLX, vLLM — всё работает из коробки с моделью по Hugging Face ID.
- Хакатонная инфраструктура (Jobs, Buckets) позволяет агентам самим считать VRAM, подбирать инстанс, считать стоимость и запускать задачи без ручной математики.
- Агенты начинают тренировать другие модели: навык LLM Trainer умеет сам подбирать батч-сайз, валидационный сплит и отправлять задачу на кластер.

## 3. Практические выводы
- Для локального coding-агента стоит начинать с PIE или llama-agent (бинарник llama.cpp), передав ID модели с Hugging Face Hub.
- Hermes Agent с GLM 5.1 — рабочая связка для интеграции в Slack/WhatsApp; агент сам чинит ошибки подключения.
- Выбирать модель под задачу можно через вкладку Benchmark datasets на Hub (SWE-Bench, OCRBench) или новый навык, который рекомендует модель для fine-tuning.
- Раздел «Use this model» в репозитории сразу показывает команды для запуска в локальных приложениях.

## 4. Упомянутые инструменты, фреймворки, компании, продукты и подходы
- **Модели:** GLM 5.1, Qwen 3.5, Chimera 2.5, Gemma 4, DeepSeek, Minimax (упомянут), Qwen-2-VL, Chandra OCR
- **Фреймворки и библиотеки:** llama.cpp, Ollama, LM Studio, MLX, vLLM, PIE, llama-agent, Hermes Agent
- **Инструменты и платформы:** Hugging Face Hub, Inference Providers (Grok, Cerebras, Novita), MCP server, Hugging Face Skills, HF CLI skill, LLM Trainer skill, Gradio skill, Datasets skill, Traces, Jobs, Buckets, Spaces
- **Бенчмарки:** SWE-Bench Pro, Humanity’s Last Exam, AIME, OCRBench
- **Лицензии:** MIT, Apache 2.0

## 5. Что полезно разработчику
- *«when you go to the model repository… on the right-hand side there is GGUF section… you have the hardware compatibility»* — квантованные модели под конкретное железо.
- *«it asked me a few questions… calculates the amount of VRAM required to run fine-tune that model»* — агент сам делает всю инженерную математику.
- Быстрый vibe-check моделей через Inference Providers с колонкой «tool use».
- Локальные трейсы агентов (Codex, PIE) можно пушить на Hub как датасет и затем файнтюнить на них модель.

## 6. Что можно применить в агентных продуктах
- **Самообучающиеся пайплайны:** агент подбирает OCR-модель по бенчмарку, пишет скрипт обработки, запускает Job на 30 000 PDF и складывает результаты в Buckets.
- **MCP-сервер** даёт агенту семантический поиск по Spaces и вызов любых приложений (генерация изображений, инференс).
- **Навыки как API:** CLI skill управляет репозиториями, Dataset skill исследует данные через Dataset Viewer API, LLM Trainer skill запускает дообучение.
- **Hermes Agent** с Traces позволит анализировать и улучшать цепочки вызовов агента на основе истории сессий.

## 7. Стоит ли смотреть полностью: maybe

## 8. Самые важные таймкоды
- [0:00:25–0:01:14] Открытость весов, кода и инфраструктуры критична для воспроизводимости и безопасности агентов.
- [0:02:54–0:03:42] Agentic-модели на Hub и тренд выпуска VLM с vision «day zero».
- [0:04:21–0:05:10] Выбор модели через Benchmark datasets (SWE-Bench, AIME) прямо на Hub.
- [0:06:54–0:07:35] Локальные coding-агенты: PIE и llama-agent с Hugging Face ID.
- [0:07:44–0:08:55] Hermes Agent — автономная интеграция в Slack и самостоятельное исправление ошибок.
- [0:09:17–0:10:14] Traces как репозиторий для сессий агентов и их визуализация в Dataset Viewer.
- [0:12:05–0:12:40] Hugging Face Skills и CLI — агент управляет репозиториями, джобами, демками.
- [0:12:55–0:14:24] LLM Trainer skill: агент рассчитывает VRAM и запускает fine-tuning Qwen-2-VL.
- [0:15:00–0:16:06] MCP-сервер — динамические Spaces для генерации изображений и инференса.
- [0:16:31–0:17:30] Сквозной кейс: OCR 30 000 статей через агента, Jobs и Buckets.
