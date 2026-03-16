---
title: WebSocket Gateways
icon: plug
description: "Handle WebSocket connections with decorated gateway classes using @WebSocketGateway"
---

WebSocket Gateways let you handle real-time connections with the same decorator-and-DI style as HTTP controllers. A gateway is a class decorated with `@WebSocketGateway` that registers itself on Elysia's native `app.ws()` endpoint.

## Defining a Gateway

```typescript
import { Injectable } from "nestelia";
import {
  WebSocketGateway,
  OnOpen,
  OnMessage,
  OnClose,
  type ElysiaWsContext,
} from "nestelia";

@Injectable()
@WebSocketGateway("/ws/chat")
export class ChatGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("connected");
  }

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {
    ws.send(JSON.stringify({ echo: message }));
  }

  @OnClose()
  handleClose(ws: ElysiaWsContext) {
    console.log("client disconnected");
  }
}
```

## Registering in a Module

Add the gateway to `gateways[]` **and** to `providers[]` so the DI container can resolve it:

```typescript
import { Module } from "nestelia";
import { ChatGateway } from "./chat.gateway";
import { ChatService } from "./chat.service";

@Module({
  providers: [ChatGateway, ChatService],
  gateways: [ChatGateway],
})
export class ChatModule {}
```

## Handler Decorators

| Decorator | Elysia hook | Arguments |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

All three are optional — only the handlers you declare are registered.

## Gateway Options

Pass any Elysia `ws()` options as the second argument to `@WebSocketGateway`:

```typescript
import { t } from "elysia";

@WebSocketGateway("/ws/secure", {
  query: t.Object({ token: t.String() }),
})
export class SecureGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const { token } = ws.data.query;
    // validate token...
  }
}
```

## Dependency Injection

Gateways fully support constructor injection — any provider registered in the same module (or an imported global module) can be injected:

```typescript
@Injectable()
@WebSocketGateway("/ws/chat")
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @OnMessage()
  async handleMessage(ws: ElysiaWsContext, message: unknown) {
    const saved = await this.chatService.save(String(message));
    ws.send(JSON.stringify(saved));
  }
}
```

## Guards

`@UseGuards()` on a gateway class runs **before the WebSocket upgrade** (in Elysia's `beforeHandle`). If a guard returns `false`, the connection is rejected with **403 Forbidden** before it is established.

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("you are authenticated");
  }
}
```

Inside the guard, `context.getType()` returns `"ws"` and `context.switchToHttp().getRequest()` returns the HTTP upgrade request so you can inspect headers and cookies:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // context.getType() === "ws" for WS gateways
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers.get("authorization") !== null;
  }
}
```

## ElysiaWsContext

`ElysiaWsContext` is a re-export of Elysia's `ElysiaWS` with loose generics. It exposes:

```typescript
ws.send(data)           // send a message to the client
ws.close()              // close the connection
ws.data                 // query, headers, and other context data
ws.data.query           // validated query params (if schema was provided)
```

## Request Pipeline

```
HTTP upgrade request
  → beforeHandle (guards run here)
  → WebSocket connection established
  → open handler
  → message handler (per message)
  → close handler
```
