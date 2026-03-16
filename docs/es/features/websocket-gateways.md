---
title: WebSocket Gateways
icon: plug
description: "Maneja conexiones WebSocket con clases gateway decoradas usando @WebSocketGateway"
---

Los WebSocket Gateways te permiten gestionar conexiones en tiempo real con el mismo estilo de decoradores y DI que los controladores HTTP. Un gateway es una clase decorada con `@WebSocketGateway` que se registra en el endpoint nativo `app.ws()` de Elysia.

## Definiendo un Gateway

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
    ws.send("conectado");
  }

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {
    ws.send(JSON.stringify({ echo: message }));
  }

  @OnClose()
  handleClose(ws: ElysiaWsContext) {
    console.log("cliente desconectado");
  }
}
```

## Registro en un Módulo

Agrega el gateway a `gateways[]` **y** a `providers[]` para que el contenedor DI pueda resolverlo:

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

## Decoradores de Manejadores

| Decorador | Hook de Elysia | Argumentos |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

Los tres son opcionales — solo se registran los manejadores que declares.

## Opciones del Gateway

Pasa cualquier opción de `ws()` de Elysia como segundo argumento a `@WebSocketGateway`:

```typescript
import { t } from "elysia";

@WebSocketGateway("/ws/secure", {
  query: t.Object({ token: t.String() }),
})
export class SecureGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const { token } = ws.data.query;
    // validar token...
  }
}
```

## Inyección de Dependencias

Los gateways soportan completamente la inyección por constructor — cualquier proveedor registrado en el mismo módulo (o en un módulo global importado) puede ser inyectado:

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

`@UseGuards()` en una clase gateway se ejecuta **antes del upgrade a WebSocket** (en `beforeHandle` de Elysia). Si un guard retorna `false`, la conexión es rechazada con **403 Forbidden** antes de establecerse.

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("estás autenticado");
  }
}
```

Dentro del guard, `context.getType()` retorna `"ws"` y `context.switchToHttp().getRequest()` devuelve la solicitud HTTP de upgrade para inspeccionar headers y cookies:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // context.getType() === "ws" para WebSocket gateways
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers.get("authorization") !== null;
  }
}
```

## ElysiaWsContext

`ElysiaWsContext` es una re-exportación de `ElysiaWS` de Elysia con genéricos amplios. Expone:

```typescript
ws.send(data)       // enviar un mensaje al cliente
ws.close()          // cerrar la conexión
ws.data             // query, headers y otros datos de contexto
ws.data.query       // parámetros query validados (si se proporcionó schema)
```

## Pipeline de Solicitud

```
Solicitud HTTP upgrade
  → beforeHandle (los guards se ejecutan aquí)
  → Conexión WebSocket establecida
  → manejador open
  → manejador message (por cada mensaje)
  → manejador close
```
