---
title: WebSocket Шлюзы
icon: plug
description: "Обработка WebSocket-соединений с помощью декорированных классов-шлюзов @WebSocketGateway"
---

WebSocket-шлюзы позволяют работать с реальным временем в том же стиле декораторов и DI, что и HTTP-контроллеры. Шлюз — это класс с декоратором `@WebSocketGateway`, который регистрирует себя на нативном эндпоинте Elysia `app.ws()`.

## Определение шлюза

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
    console.log("клиент отключился");
  }
}
```

## Регистрация в модуле

Добавьте шлюз в `gateways[]` **и** в `providers[]`, чтобы DI-контейнер мог его разрешить:

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

## Декораторы обработчиков

| Декоратор | Хук Elysia | Аргументы |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

Все три необязательны — регистрируются только объявленные обработчики.

## Опции шлюза

Передайте любые опции Elysia `ws()` вторым аргументом в `@WebSocketGateway`:

```typescript
import { t } from "elysia";

@WebSocketGateway("/ws/secure", {
  query: t.Object({ token: t.String() }),
})
export class SecureGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const { token } = ws.data.query;
    // проверка токена...
  }
}
```

## Внедрение зависимостей

Шлюзы полностью поддерживают инъекцию через конструктор — любой провайдер, зарегистрированный в том же модуле (или в импортированном глобальном модуле), может быть внедрён:

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

## Гвардии (Guards)

`@UseGuards()` на классе шлюза запускается **до WebSocket-апгрейда** (в `beforeHandle` Elysia). Если гвард возвращает `false`, соединение отклоняется с **403 Forbidden** ещё до его установки.

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("вы аутентифицированы");
  }
}
```

Внутри гварда `context.getType()` возвращает `"ws"`, а `context.switchToHttp().getRequest()` — HTTP-запрос апгрейда, где можно проверить заголовки и куки:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // context.getType() === "ws" для WebSocket-шлюзов
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers.get("authorization") !== null;
  }
}
```

## ElysiaWsContext

`ElysiaWsContext` — это реэкспорт `ElysiaWS` из Elysia с обобщёнными типами. Предоставляет:

```typescript
ws.send(data)       // отправить сообщение клиенту
ws.close()          // закрыть соединение
ws.data             // query, headers и другие данные контекста
ws.data.query       // валидированные query-параметры (если передана схема)
```

## Цикл обработки запроса

```
HTTP upgrade-запрос
  → beforeHandle (здесь запускаются гвардии)
  → WebSocket-соединение установлено
  → обработчик open
  → обработчик message (на каждое сообщение)
  → обработчик close
```
