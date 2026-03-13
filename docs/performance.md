---
title: Performance
description: Nestelia benchmark results compared to NestJS, Express, and Fastify
---

<script setup>
import PerformanceChart from './.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from './.vitepress/theme/benchmark-data'
</script>

# Performance

Nestelia adds a thin decorator and dependency-injection layer on top of Elysia — with near-zero overhead. The result: NestJS-style developer experience at Elysia-level speed.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Average reqs/s across 5 scenarios. 500 connections, 10s per scenario. macOS arm64, Bun 1.3, Node 24."
/>

## Results by scenario

| Scenario | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 75,868 | 77,912 | 47,946 | 40,605 | 39,098 |
| **JSON** GET /json | 75,232 | 78,548 | 45,279 | 38,472 | 36,752 |
| **Path Params** GET /user/:id | 58,854 | 76,953 | 45,867 | 38,658 | 28,003 |
| **POST JSON** POST /user | 51,266 | 64,383 | 30,567 | 34,119 | 24,707 |
| **DI + Service** GET /users | 73,983 | 77,585 | 44,757 | 38,126 | 25,550 |
| **Average** | **67,041** | **75,076** | **42,883** | **37,996** | **30,822** |

## How to reproduce

```bash
# Install benchmark dependencies
cd benchmark && bun install && cd ..

# Install a load testing tool
brew install bombardier

# Run all benchmarks (5 scenarios × 5 frameworks)
bun run bench

# Or run specific frameworks
bun run bench nestelia elysia fastify
```

## Why is Nestelia fast?

Nestelia resolves all dependency injection, module wiring, and route registration **at startup time**. At request time, simple handlers call service methods directly — no middleware chain, no per-request container lookups, no reflection.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| HTTP layer | Elysia | Express (default) |
| DI resolution | Startup-time | Startup-time |
| Metadata reflection | Cached at startup | Per-request |
| Request context | Fast path skips it | Always created |
| Middleware chain | None (Elysia handlers) | Express middleware stack |
| Validation | Elysia TypeBox (compile-time) | class-validator (runtime reflection) |
