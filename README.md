<div align="center">

<img src="https://raw.githubusercontent.com/nestelia/nestelia/main/assets/logo.svg" alt="nestelia" width="200" height="200" />

<h1>nestelia</h1>

<p>
  <b>Production-grade modular framework for <a href="https://elysiajs.com/">Elysia</a></b><br />
  Decorators · Dependency Injection · Modules · Lifecycle Hooks · GraphQL · Microservices
</p>

<p>
  <a href="https://www.npmjs.com/package/nestelia"><img src="https://img.shields.io/npm/v/nestelia?style=flat-square&color=cb3837&logo=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/nestelia"><img src="https://img.shields.io/npm/dm/nestelia?style=flat-square&color=cb3837&logo=npm" alt="npm downloads" /></a>
  <a href="https://github.com/nestelia/nestelia"><img src="https://img.shields.io/github/stars/nestelia/nestelia?style=flat-square&logo=github" alt="GitHub stars" /></a>
  <a href="https://github.com/nestelia/nestelia/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License: MIT" /></a>
  <br />
  <a href="https://bun.sh"><img src="https://img.shields.io/badge/runtime-Bun-000?style=flat-square&logo=bun&logoColor=fbf0df" alt="Bun" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/lang-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <img src="https://img.shields.io/badge/tests-864%2F864%20passing-brightgreen?style=flat-square" alt="Tests" />
  <a href="https://nestelia.dev"><img src="https://img.shields.io/badge/docs-nestelia.dev-10b981?style=flat-square" alt="Documentation" /></a>
</p>

<p>
  <a href="https://nestelia.dev">📖 Documentation</a> ·
  <a href="https://www.npmjs.com/package/nestelia">📦 npm</a> ·
  <a href="https://github.com/nestelia/nestelia">💻 GitHub</a> ·
  <a href="https://github.com/nestelia/nestelia/discussions">💬 Discussions</a>
</p>

</div>

---

## 📑 Table of Contents

- [What is nestelia?](#-what-is-nestelia)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Ecosystem](#-ecosystem)
- [Examples](#-examples)
  - [Guard](#guard)
  - [Interceptor](#interceptor)
  - [GraphQL Subscription](#graphql-subscription)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Claude Code Skill](#-claude-code-skill)
- [License](#-license)

---

## 🎯 What is nestelia?

**nestelia** brings the developer experience of NestJS to the [Elysia](https://elysiajs.com/) ecosystem. Write familiar decorator-based controllers, wire up services via dependency injection, and structure your app into modules — all while running on Bun's blazing-fast HTTP engine.

If you know NestJS, you already know nestelia.

```typescript
import "reflect-metadata";
import { Controller, Get, Injectable, Module, createElysiaApplication } from "nestelia";

@Injectable()
class GreetingService {
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}

@Controller("/")
class AppController {
  constructor(private readonly greeting: GreetingService) {}

  @Get("/hello/:name")
  hello(@Param("name") name: string) {
    return this.greeting.greet(name);
  }
}

@Module({
  controllers: [AppController],
  providers: [GreetingService],
})
class AppModule {}

const app = await createElysiaApplication(AppModule);
app.listen(3000, () => console.log("🦊 Listening on http://localhost:3000"));
```

---

## ✨ Features

<table>
<tr>
<td width="33%">

**🏗️ Decorators**

`@Controller`, `@Get`, `@Post`, `@Body`, `@Param`, `@Query`, `@Headers`, and the full Express-style routing surface you expect.

</td>
<td width="33%">

**💉 Dependency Injection**

Constructor-based DI with `singleton`, `transient`, and `request` scopes. Circular dependency detection and auto-wiring out of the box.

</td>
<td width="33%">

**📦 Modules**

Encapsulate controllers, providers, and imports. Re-use logic across apps with clean boundaries and explicit exports.

</td>
</tr>
<tr>
<td>

**⚡ Lifecycle Hooks**

`OnModuleInit`, `OnApplicationBootstrap`, `OnModuleDestroy`, and `BeforeApplicationShutdown` for deterministic startup & teardown.

</td>
<td>

**🛡️ Guards, Interceptors & Pipes**

Composable request pipeline. Auth guards, logging interceptors, validation pipes — all via decorators.

</td>
<td>

**🌐 Exception Handling**

Built-in HTTP exceptions (`BadRequestException`, `NotFoundException`, etc.) and custom `@Catch()` filters.

</td>
</tr>
<tr>
<td>

**📝 Swagger / OpenAPI**

Automatic OpenAPI documentation generated from decorators. Zero config for basic specs, full control when you need it.

</td>
<td>

**⏰ Task Scheduling**

Cron jobs, intervals, and timeouts via `@Cron()`, `@Interval()`, `@Timeout()` decorators.

</td>
<td>

**🚀 Microservices**

Redis, RabbitMQ, and TCP transports with `@MessagePattern` and `@EventPattern` handlers.

</td>
</tr>
</table>

---

## 🚀 Quick Start

```bash
# 1. Create a new project
bun init -y

# 2. Install dependencies
bun add nestelia elysia reflect-metadata

# 3. Enable decorators in tsconfig.json
#    "experimentalDecorators": true
#    "emitDecoratorMetadata": true
```

**`src/main.ts`**

```typescript
import "reflect-metadata";
import { Controller, Get, Module, createElysiaApplication } from "nestelia";

@Controller()
class AppController {
  @Get()
  index() {
    return { message: "Hello from nestelia!" };
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

const app = await createElysiaApplication(AppModule);
app.listen(3000);

console.log("🦊 Server running at http://localhost:3000");
```

```bash
bun run src/main.ts
# → 🦊 Server running at http://localhost:3000
```

---

## 📦 Ecosystem

All packages are published under the single `nestelia` package with subpath exports.

| Import | Description |
|--------|-------------|
| `nestelia` | Core framework — DI, decorators, modules, lifecycle |
| `nestelia/scheduler` | Cron jobs, intervals, timeouts |
| `nestelia/microservices` | Redis, RabbitMQ, TCP transports |
| `nestelia/apollo` | Apollo GraphQL code-first |
| `nestelia/passport` | Passport.js authentication integration |
| `nestelia/testing` | Isolated test modules with provider overrides |
| `nestelia/cache` | Response caching with `@CacheKey()`, `@CacheTTL()` |
| `nestelia/rabbitmq` | Advanced RabbitMQ messaging patterns |
| `nestelia/graphql-pubsub` | Redis-backed PubSub for GraphQL subscriptions |

---

## 📚 Examples

### Guard

```typescript
import { Injectable, CanActivate, ExecutionContext } from "nestelia";

@Injectable()
class AuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const request = ctx.switchToHttp().getRequest();
    return request.headers.authorization === "Bearer secret";
  }
}

@Controller()
class AppController {
  @Get("/protected")
  @UseGuards(AuthGuard)
  protected() {
    return { secret: "🎉 You passed!" };
  }
}
```

### Interceptor

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "nestelia";
import { map } from "rxjs/operators";

@Injectable()
class TransformInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(map(data => ({ data, timestamp: Date.now() })));
  }
}
```

### GraphQL Subscription

```typescript
import { Resolver, Query, Subscription } from "@nestelia/apollo";
import { PubSub } from "@nestelia/graphql-pubsub";

@Resolver()
class NotificationResolver {
  constructor(private readonly pubsub: PubSub) {}

  @Query()
  notifications() {
    return [];
  }

  @Subscription(() => String, { topics: "NEW_NOTIFICATION" })
  newNotification() {
    return this.pubsub.asyncIterator("NEW_NOTIFICATION");
  }
}
```

---

## 🧪 Testing

```typescript
import { Test } from "nestelia/testing";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

describe("AppController", () => {
  let controller: AppController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get(AppController);
  });

  it("should return hello", () => {
    expect(controller.hello("World")).toEqual("Hello, World!");
  });
});
```

---

## 📖 Documentation

Full guides, API references, and recipes are available at **[nestelia.dev](https://nestelia.dev)**.

Run the docs locally:

```bash
bun install
bun run docs:dev
```

---

## 🤖 Claude Code Skill

A first-party [Claude Code](https://claude.ai/claude-code) skill is available for nestelia. It provides scaffolding templates, decorator usage patterns, and framework best practices directly inside your AI assistant.

```bash
npx skills add nestelia/nestelia
```

---

## ⭐ Star History

<a href="https://github.com/nestelia/nestelia">
  <img src="https://api.star-history.com/svg?repos=nestelia/nestelia&type=Date" alt="Star History Chart" width="600" />
</a>

---

## 📄 License

[MIT](https://github.com/nestelia/nestelia/blob/main/LICENSE) © [Islam Kiiasov](https://github.com/kiyasov)
