---
title: WebSocket Gateways
icon: plug
description: "Trate conexões WebSocket com classes gateway decoradas usando @WebSocketGateway"
---

Os WebSocket Gateways permitem lidar com conexões em tempo real com o mesmo estilo de decoradores e DI dos controladores HTTP. Um gateway é uma classe decorada com `@WebSocketGateway` que se registra no endpoint nativo `app.ws()` do Elysia.

## Definindo um Gateway

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

## Registro em um Módulo

Adicione o gateway a `gateways[]` **e** a `providers[]` para que o contêiner DI possa resolvê-lo:

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

## Decoradores de Handlers

| Decorador | Hook do Elysia | Argumentos |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

Os três são opcionais — apenas os handlers declarados são registrados.

## Opções do Gateway

Passe quaisquer opções de `ws()` do Elysia como segundo argumento para `@WebSocketGateway`:

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

## Injeção de Dependências

Gateways suportam completamente a injeção por construtor — qualquer provider registrado no mesmo módulo (ou em um módulo global importado) pode ser injetado:

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

`@UseGuards()` em uma classe gateway é executado **antes do upgrade para WebSocket** (no `beforeHandle` do Elysia). Se um guard retornar `false`, a conexão é rejeitada com **403 Forbidden** antes de ser estabelecida.

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("você está autenticado");
  }
}
```

Dentro do guard, `context.getType()` retorna `"ws"` e `context.switchToHttp().getRequest()` retorna a requisição HTTP de upgrade para inspecionar headers e cookies:

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

`ElysiaWsContext` é uma re-exportação de `ElysiaWS` do Elysia com genéricos amplos. Expõe:

```typescript
ws.send(data)       // enviar uma mensagem ao cliente
ws.close()          // fechar a conexão
ws.data             // query, headers e outros dados de contexto
ws.data.query       // parâmetros query validados (se schema foi fornecido)
```

## Pipeline de Requisição

```
Requisição HTTP upgrade
  → beforeHandle (guards executam aqui)
  → Conexão WebSocket estabelecida
  → handler open
  → handler message (por cada mensagem)
  → handler close
```
