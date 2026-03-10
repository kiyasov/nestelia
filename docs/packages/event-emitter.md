---
title: Event Emitter
icon: zap
description: Type-safe event emitter with wildcard support and DI integration
---

The Event Emitter module provides a type-safe, async-capable event system with optional wildcard pattern matching. Methods decorated with `@OnEvent()` are automatically discovered and wired during bootstrap — no manual registration required.

## Installation

No extra dependencies needed — the module is included in `nestelia`.

## Setup

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // enable "order.*" and "**" patterns
      global: true,    // make EventEmitter2 available everywhere
    }),
  ],
})
export class AppModule {}
```

## Emitting events

Inject `EventEmitter2` and call `emitAsync` (awaits all handlers) or `emit` (fire-and-forget):

```typescript
import { Injectable } from "nestelia";
import { EventEmitter2 } from "nestelia/event-emitter";
import type { Order } from "./order.schema";

@Injectable()
export class OrdersService {
  constructor(private readonly events: EventEmitter2) {}

  async placeOrder(order: Order) {
    // ... persist order ...
    await this.events.emitAsync("order.created", order);
    return order;
  }
}
```

### @InjectEventEmitter()

Shorthand for `@Inject(EVENT_EMITTER_TOKEN)`:

```typescript
import { Injectable } from "nestelia";
import { InjectEventEmitter, EventEmitter2 } from "nestelia/event-emitter";

@Injectable()
export class NotificationService {
  constructor(
    @InjectEventEmitter() private readonly events: EventEmitter2,
  ) {}
}
```

## Listening to events

Decorate any method in any `@Injectable()` provider with `@OnEvent()`. The module scans all providers during `onApplicationBootstrap` and registers the handlers automatically.

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";
import type { Order } from "./order.schema";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("New order:", order.id);
  }

  @OnEvent("order.shipped")
  handleOrderShipped(order: Order) {
    console.log("Order shipped:", order.id);
  }
}
```

> Register your listener class as a `provider` in the relevant module:
> ```typescript
> @Module({ providers: [NotificationListener] })
> export class OrdersModule {}
> ```

### Once handlers

```typescript
@OnEvent("app.initialized", { once: true })
onAppReady(payload: unknown) {
  console.log("Application is ready");
}
```

## Wildcard patterns

Enable `wildcard: true` in `forRoot` to use glob-style patterns:

| Pattern | Matches |
|---------|---------|
| `order.*` | `order.created`, `order.shipped`, … |
| `**.created` | `order.created`, `user.created`, … |
| `**` | every event |

```typescript
@Injectable()
export class AuditListener {
  @OnEvent("order.*")
  logOrderEvent(order: Order) {
    console.log("Audit:", order.id);
  }

  @OnEvent("**")
  logAll(payload: unknown) {
    console.log("Event fired:", payload);
  }
}
```

## Configuration

### EventEmitterModuleOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `wildcard` | `boolean` | `false` | Enable `*` / `**` wildcard matching |
| `delimiter` | `string` | `"."` | Namespace delimiter |
| `maxListeners` | `number` | `10` | Max listeners per event before a warning |
| `global` | `boolean` | `false` | Register as a global module |

## EventEmitter2 API

| Method | Signature | Description |
|--------|-----------|-------------|
| `emit` | `(event, payload?) → boolean` | Fire event, don't await handlers |
| `emitAsync` | `(event, payload?) → Promise<unknown[]>` | Fire event and await all handlers |
| `on` | `(event, handler) → this` | Register persistent handler |
| `once` | `(event, handler) → this` | Register one-time handler |
| `off` | `(event, handler?) → this` | Remove handler (or all for event) |
| `removeAllListeners` | `(event?) → this` | Remove all listeners |
| `listenerCount` | `(event) → number` | Number of registered handlers |

## Exports

| Export | Description |
|--------|-------------|
| `EventEmitterModule` | Module class |
| `EventEmitter2` | Injectable event emitter service |
| `OnEvent(event, opts?)` | Method decorator for event handlers |
| `InjectEventEmitter()` | Parameter decorator shorthand |
| `EVENT_EMITTER_TOKEN` | Injection token |
| `EventEmitterModuleOptions` | Options interface |
