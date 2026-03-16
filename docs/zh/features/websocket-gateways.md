---
title: WebSocket 网关
icon: plug
description: "使用 @WebSocketGateway 装饰器类处理 WebSocket 连接"
---

WebSocket 网关让你以与 HTTP 控制器相同的装饰器和依赖注入风格处理实时连接。网关是一个带有 `@WebSocketGateway` 装饰器的类，它将自己注册到 Elysia 的原生 `app.ws()` 端点。

## 定义网关

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
    ws.send("已连接");
  }

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {
    ws.send(JSON.stringify({ echo: message }));
  }

  @OnClose()
  handleClose(ws: ElysiaWsContext) {
    console.log("客户端断开连接");
  }
}
```

## 在模块中注册

将网关添加到 `gateways[]` **和** `providers[]`，以便 DI 容器能够解析它：

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

## 处理器装饰器

| 装饰器 | Elysia 钩子 | 参数 |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

三个装饰器都是可选的——只有声明的处理器才会被注册。

## 网关选项

将任何 Elysia `ws()` 选项作为第二个参数传给 `@WebSocketGateway`：

```typescript
import { t } from "elysia";

@WebSocketGateway("/ws/secure", {
  query: t.Object({ token: t.String() }),
})
export class SecureGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const { token } = ws.data.query;
    // 验证 token...
  }
}
```

## 依赖注入

网关完全支持构造函数注入——在同一模块（或已导入的全局模块）中注册的任何提供者都可以被注入：

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

## 守卫（Guards）

网关类上的 `@UseGuards()` 在 **WebSocket 升级之前**运行（在 Elysia 的 `beforeHandle` 中）。如果守卫返回 `false`，连接在建立之前就会以 **403 Forbidden** 被拒绝。

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("您已通过身份验证");
  }
}
```

在守卫内部，`context.getType()` 返回 `"ws"`，`context.switchToHttp().getRequest()` 返回 HTTP 升级请求，可以检查请求头和 Cookie：

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // context.getType() === "ws" 用于 WebSocket 网关
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers.get("authorization") !== null;
  }
}
```

## ElysiaWsContext

`ElysiaWsContext` 是 Elysia `ElysiaWS` 的宽泛泛型重导出，提供：

```typescript
ws.send(data)       // 向客户端发送消息
ws.close()          // 关闭连接
ws.data             // query、headers 和其他上下文数据
ws.data.query       // 已验证的 query 参数（如果提供了 schema）
```

## 请求处理流程

```
HTTP 升级请求
  → beforeHandle（守卫在此运行）
  → WebSocket 连接建立
  → open 处理器
  → message 处理器（每条消息触发一次）
  → close 处理器
```
