---
title: Performance
description: Resultados de benchmark do Nestelia comparados com NestJS, Express e Fastify
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# Performance

Nestelia adiciona uma camada fina de decoradores e injeção de dependência sobre o Elysia — com overhead quase zero. O resultado: experiência de desenvolvimento estilo NestJS na velocidade do Elysia.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Média de reqs/s em 5 cenários. 500 conexões, 10s por cenário. macOS arm64, Bun 1.3, Node 24."
/>

## Resultados por cenário

| Cenário | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 75,868 | 77,912 | 47,946 | 40,605 | 39,098 |
| **JSON** GET /json | 75,232 | 78,548 | 45,279 | 38,472 | 36,752 |
| **Path Params** GET /user/:id | 58,854 | 76,953 | 45,867 | 38,658 | 28,003 |
| **POST JSON** POST /user | 51,266 | 64,383 | 30,567 | 34,119 | 24,707 |
| **DI + Service** GET /users | 73,983 | 77,585 | 44,757 | 38,126 | 25,550 |
| **Média** | **67,041** | **75,076** | **42,883** | **37,996** | **30,822** |

## Como reproduzir

```bash
# Instalar dependências do benchmark
cd benchmark && bun install && cd ..

# Instalar ferramenta de teste de carga
brew install bombardier

# Executar todos os benchmarks (5 cenários × 5 frameworks)
bun run bench

# Ou executar frameworks específicos
bun run bench nestelia elysia fastify
```

## Por que o Nestelia é rápido?

Nestelia resolve toda a injeção de dependência, conexão de módulos e registro de rotas **no momento da inicialização**. No momento da requisição, os controllers chamam métodos de serviço diretamente — sem cadeia de middleware, sem buscas no container por requisição.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| Camada HTTP | Elysia | Express (padrão) |
| Resolução DI | Na inicialização | Na inicialização |
| Reflexão de metadados | Cache na inicialização | Por requisição |
| Contexto da requisição | Caminho rápido ignora | Sempre criado |
| Cadeia de middleware | Nenhuma (handlers Elysia) | Stack de middleware Express |
| Validação | Elysia TypeBox (compilação) | class-validator (reflexão em runtime) |
