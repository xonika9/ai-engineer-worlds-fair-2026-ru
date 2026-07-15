# From fork() to Fleet: Designing an Agent Sandbox Cloud

- Спикеры: Abhishek Bhardwaj, OpenAI
- Трек: Online Track
- Видео: [YouTube](https://www.youtube.com/watch?v=OqM67QG_Ikk)
- Официальный источник: [расписание AI Engineer World's Fair](https://www.ai.engineer/worldsfair/schedule)
- Статус обработки: summarized

> Это русскоязычное саммари. Полные расшифровки и медиафайлы здесь не публикуются.

## 1. О чём доклад

First-principles разбор того, как устроен облачный sandbox для запуска недоверенного кода AI-агентов. Спикер из команды RL и agent infrastructure в OpenAI (инфраструктура для ChatGPT и Codex Web) объясняет, зачем моделям нужно исполнение кода, почему это создаёт угрозы безопасности, и последовательно проходит эволюцию изоляции: fork/exec → контейнеры → gVisor → аппаратная виртуализация и micro VMs. Три опорных столпа доклада — runtime (безопасный запуск на одной ноде), persistence (долговременное хранилище со снапшотами) и orchestration (масштабирование на флот нод).

## 2. Главные идеи

- Исполнение кода дало моделям «verifiable rewards»: на задачах вроде математики и кода правильность проверяема, и модель обучается вызывать инструменты и писать работающий код. То же самое нужно поддержать и в продукте (harness парсит ответ и исполняет код).
- Недоверенный код нужно изолировать: даже «не злонамеренная» модель из усердия может попытаться получить root или проэксплуатировать ядро; в облаке рядом крутятся sandbox-ы других пользователей, чьи данные нельзя утечь.
- Два вектора атаки в Linux: получить root (по-прежнему ring 3, но максимальные привилегии) и эксплойт ядра (ring 0) — последнее «статья в New York Times, ждущая своего часа».
- Лестница изоляции: fork/exec (быстро, но noisy neighbor и прямой доступ к ядру) → контейнеры (namespaces + cgroups, плюс seccomp, но тот же хостовый kernel) → gVisor (user-space ядро Sentry + Gofer, но возможна цепочка из двух эксплойтов до хоста) → аппаратная виртуализация.
- Аппаратная виртуализация (KVM, VMX root/non-root) даёт границу на уровне CPU: гость может получить ring 0 внутри себя, но хост защищён. Цена — накладные расходы на переключение контекстов гость/хост.
- Micro VM — это про сам VMM, а не про гостя: новые Rust-VMM (CrosVM, Firecracker, Cloud Hypervisor) имеют меньший memory footprint, быстрее грузятся, memory-safe и позволяют «джейлить» эмулируемые устройства (block/net) по отдельности.
- Persistence — «следующий unlock»: с диском агент становится настоящим knowledge worker. Снапшоты должны быть инкрементальными, дешёвыми и быстрыми на восстановление; они же повышают надёжность (восстановление на другой ноде) и позволяют harness делать Monte Carlo tree search с backtracking.
- Позиция автора: системными трюками можно закрыть проблемы производительности, но не бреши в безопасности — доверие теряется один раз. Поэтому всегда выбирать более безопасное решение.

## 3. Практические выводы

- Если строите sandbox-платформу с нуля — начинайте сразу с micro VMs, а не проходите «семь стадий горя» (containers → gVisor → V8 isolates) и не приходите к VM через два года мучений.
- Различайте потребности research и product: в research оптимизируют throughput (много rollouts параллельно), в product — latency (медленный старт sandbox = churn); reliability и security важны в обоих.
- Для block-level снапшотов используйте copy-on-write (XFS-подобные ФС), FIEMAP для определения изменившихся extent-ов, инкрементальную выгрузку в облако; можно «соврать» harness и вернуть snapshot ID сразу, догружая в фоне.
- Для always-on persistence — блочное устройство внутри гостя поверх tiered-кэша (in-cluster cache → object storage через NBD); NFS хуже, так как не так производителен и не POSIX-совместим, а модели лучше работают с POSIX-стандартом.
- Отдавайте гостю блочное устройство, а не shared-folder: файловые операции через shared folder заставляют постоянно выходить в хост (медленно), block device использует кэши гостя.
- Для low-latency старта — pre-warmed пул, memory-снапшот с JIT-стартом за миллисекунды или гибрид (тёплый пул, растущий из memory-снапшотов).
- В оркестрации учитывайте lineage снапшота: маршрутизируйте sandbox на ноду, где уже есть максимум нужных слоёв (меньше качать).

## 4. Упомянутые инструменты, фреймворки, компании, продукты и подходы

- OpenAI (ChatGPT, Codex, Codex Web, «gold mode» в Codex), RL / agent infrastructure team.
- Linux-примитивы: threads, system calls / ioctls, rings (ring 0 kernel / ring 3 user), fork/exec, namespaces (PID, mount и др.), cgroups, seccomp.
- gVisor (Sentry — user-space ядро на Go, Gopher — доступ к ФС).
- Аппаратная виртуализация: KVM (/dev/kvm), VMX root / VMX non-root, VMM, QEMU, virtio, PCI-устройства, paravirtualization, balloon driver, Vsock, VFIO, virtio-GPU.
- Rust-VMM: CrosVM (создан в Google для VM на Chromebook), Firecracker (форк CrosVM, Amazon Lambda/serverless), Cloud Hypervisor.
- Хранилище: block devices, inode, XFS-подобные ФС, copy-on-write, FIEMAP, NBD, GCS/S3/durable block storage, NFS.
- «Open claw» (открытый агент, упоминается как пример локально запускаемых агентов), Hetzner / Mac mini в облаке, VPS.
- Прошлогодний доклад автора «How to build an AI sandbox from scratch» (spiritual prequel).

## 5. Что полезно разработчику

Ясная first-principles картина того, что реально происходит, когда агент «исполняет код»: от system call и колец привилегий до KVM и virtio. Полезно для тех, кто выбирает уровень изоляции для своего продукта, понимает trade-off производительность/безопасность и хочет знать, чем отличаются контейнеры, gVisor и micro VM на уровне механизмов, а не маркетинга. Отдельная ценность — практические рецепты снапшотинга дисков (COW, FIEMAP, инкременты, tiered-кэш через NBD).

## 6. Что можно применить в агентных продуктах

- Запускать недоверенный код агентов в micro VM, а не в контейнерах, если нужна и гибкость «целого Linux-бокса», и жёсткая изоляция.
- Внедрить чекпоинтинг состояния диска sandbox: восстановление на другой ноде при сбоях, апгрейд кластера без потери работы, A/B на нодах.
- Дать harness возможность snapshot/restore для sample-space exploration (MCTS с backtracking) — многодневные rollouts без потери прогресса.
- Оптимизировать холодный старт через memory-снапшоты и warm pool; учитывать lineage снапшотов при выборе ноды.
- Джейлить эмулируемые устройства (seccomp на block/net back-end), чтобы компрометация одного устройства не роняла всю систему.

## 7. Стоит ли смотреть полностью

yes — редкий доклад, который честно и по первым принципам проходит весь стек изоляции недоверенного кода вплоть до KVM/virtio и снапшотинга дисков. Особенно полезен инженерам, строящим sandbox-инфраструктуру или выбирающим её. Слайды с диаграммами важны — по одному аудио часть деталей теряется.

## 8. Самые важные таймкоды

- [0:01:39] Зачем моделям исполнение кода: verifiable rewards на математике и коде.
- [0:04:53] Что такое sandbox и зачем изолировать недоверенный код.
- [0:06:33] Разные нужды research (throughput) и product (latency); три столпа: runtime, persistence, orchestration.
- [0:09:18] First principles: threads, system calls, кольца привилегий, два вектора атаки.
- [0:12:07] Контейнеры: namespaces, cgroups, seccomp и их пределы.
- [0:16:10] gVisor (Sentry/Gopher) и проблема цепочки эксплойтов до хоста.
- [0:18:52] Аппаратная виртуализация: VMX root/non-root, защита хоста на уровне CPU.
- [0:20:36] VMM, QEMU, /dev/KVM, paravirtualization и virtio.
- [0:24:25] Почему «micro» в micro VM — про сам VMM; CrosVM, Firecracker, Cloud Hypervisor.
- [0:30:26] Persistence: зачем sandbox durable-диск и три сценария.
- [0:38:47] Explicit persistence через copy-on-write, FIEMAP и снапшоты.
- [0:41:30] Orchestration: кластеры, scheduler, low-latency старт и маршрутизация по lineage снапшотов.
