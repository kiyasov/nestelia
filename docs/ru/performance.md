---
title: Производительность
description: Результаты бенчмарков Nestelia в сравнении с NestJS, Express и Fastify
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# Производительность

Nestelia добавляет тонкий слой декораторов и внедрения зависимостей поверх Elysia — практически без потери производительности. Результат: удобство разработки как в NestJS на скорости Elysia.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Среднее кол-во запросов/с по 5 сценариям. 500 соединений, 10с на сценарий. macOS arm64, Bun 1.3, Node 24."
/>

## Результаты по сценариям

| Сценарий | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 75,868 | 77,912 | 47,946 | 40,605 | 39,098 |
| **JSON** GET /json | 75,232 | 78,548 | 45,279 | 38,472 | 36,752 |
| **Path Params** GET /user/:id | 58,854 | 76,953 | 45,867 | 38,658 | 28,003 |
| **POST JSON** POST /user | 51,266 | 64,383 | 30,567 | 34,119 | 24,707 |
| **DI + Сервис** GET /users | 73,983 | 77,585 | 44,757 | 38,126 | 25,550 |
| **Среднее** | **67,041** | **75,076** | **42,883** | **37,996** | **30,822** |

## Как воспроизвести

```bash
# Установить зависимости бенчмарка
cd benchmark && bun install && cd ..

# Установить инструмент нагрузочного тестирования
brew install bombardier

# Запустить все бенчмарки (5 сценариев × 5 фреймворков)
bun run bench

# Или запустить конкретные фреймворки
bun run bench nestelia elysia fastify
```

## Почему Nestelia быстрый?

Nestelia выполняет всё внедрение зависимостей, связывание модулей и регистрацию маршрутов **на этапе запуска**. Во время обработки запросов простые хендлеры вызывают методы сервисов напрямую — без цепочки middleware, без поиска по контейнеру, без рефлексии.

| | Nestelia | NestJS |
|---|---|---|
| Рантайм | Bun | Node.js |
| HTTP слой | Elysia | Express (по умолчанию) |
| DI разрешение | На этапе запуска | На этапе запуска |
| Рефлексия метаданных | Кэшируется при старте | На каждый запрос |
| Request context | Fast path пропускает | Всегда создаётся |
| Цепочка middleware | Нет (обработчики Elysia) | Стек middleware Express |
| Валидация | Elysia TypeBox (на этапе компиляции) | class-validator (рефлексия в рантайме) |
