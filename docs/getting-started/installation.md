---
title: Installation
icon: download
description: Install nestelia and set up your project
---

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or later
- TypeScript 5.0+

## Install

```bash
bun add nestelia elysia
```

nestelia requires `elysia` ^1.2.0 as a peer dependency.

## TypeScript Configuration

nestelia relies on decorators and metadata reflection. Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

## Optional Peer Dependencies

All subpaths are included in the `nestelia` package. Install only the peer dependencies you need:

```bash
# Microservices — Redis transport
bun add ioredis

# Microservices — RabbitMQ transport
bun add amqplib

# Apollo GraphQL
bun add @apollo/server graphql graphql-ws

# Passport authentication
bun add passport

# Cache manager
bun add cache-manager

# RabbitMQ messaging
bun add amqplib

# GraphQL PubSub (Redis)
bun add ioredis
```

## Verify Installation

Create a minimal app to verify everything works:

```typescript
import { createElysiaApplication, Controller, Get, Module } from "nestelia";

@Controller("/")
class AppController {
  @Get("/")
  hello() {
    return { status: "ok" };
  }
}

@Module({ controllers: [AppController] })
class AppModule {}

const app = await createElysiaApplication(AppModule);
app.listen(3000, () => {
  console.log("Running on http://localhost:3000");
});
```

```bash
bun run app.ts
```
