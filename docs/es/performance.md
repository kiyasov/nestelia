---
title: Rendimiento
description: Resultados de benchmark de Nestelia comparados con NestJS, Express y Fastify
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# Rendimiento

Nestelia agrega una capa delgada de decoradores e inyección de dependencias sobre Elysia — con casi cero overhead. El resultado: experiencia de desarrollo estilo NestJS a la velocidad de Elysia.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Promedio de reqs/s en 5 escenarios. 500 conexiones, 10s por escenario. macOS arm64, Bun 1.3, Node 24."
/>

## Resultados por escenario

| Escenario | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 75,868 | 77,912 | 47,946 | 40,605 | 39,098 |
| **JSON** GET /json | 75,232 | 78,548 | 45,279 | 38,472 | 36,752 |
| **Path Params** GET /user/:id | 58,854 | 76,953 | 45,867 | 38,658 | 28,003 |
| **POST JSON** POST /user | 51,266 | 64,383 | 30,567 | 34,119 | 24,707 |
| **DI + Service** GET /users | 73,983 | 77,585 | 44,757 | 38,126 | 25,550 |
| **Promedio** | **67,041** | **75,076** | **42,883** | **37,996** | **30,822** |

## Cómo reproducir

```bash
# Instalar dependencias del benchmark
cd benchmark && bun install && cd ..

# Instalar herramienta de prueba de carga
brew install bombardier

# Ejecutar todos los benchmarks (5 escenarios × 5 frameworks)
bun run bench

# O ejecutar frameworks específicos
bun run bench nestelia elysia fastify
```

## ¿Por qué Nestelia es rápido?

Nestelia resuelve toda la inyección de dependencias, el cableado de módulos y el registro de rutas **en tiempo de inicio**. En tiempo de solicitud, los controladores llaman a los métodos de servicio directamente — sin cadena de middleware, sin búsquedas en el contenedor por solicitud.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| Capa HTTP | Elysia | Express (por defecto) |
| Resolución DI | En tiempo de inicio | En tiempo de inicio |
| Reflexión de metadatos | Cache en inicio | Por solicitud |
| Contexto de solicitud | Ruta rápida lo omite | Siempre creado |
| Cadena de middleware | Ninguna (handlers de Elysia) | Stack de middleware de Express |
| Validación | Elysia TypeBox (compilación) | class-validator (reflexión en runtime) |
