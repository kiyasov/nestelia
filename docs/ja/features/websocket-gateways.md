---
title: WebSocket ゲートウェイ
icon: plug
description: "@WebSocketGateway でデコレートされたゲートウェイクラスを使って WebSocket 接続を処理する"
---

WebSocket ゲートウェイを使うと、HTTP コントローラーと同じデコレーターと DI スタイルでリアルタイム接続を処理できます。ゲートウェイは `@WebSocketGateway` でデコレートされたクラスで、Elysia のネイティブ `app.ws()` エンドポイントに自身を登録します。

## ゲートウェイの定義

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
    ws.send("接続しました");
  }

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {
    ws.send(JSON.stringify({ echo: message }));
  }

  @OnClose()
  handleClose(ws: ElysiaWsContext) {
    console.log("クライアントが切断されました");
  }
}
```

## モジュールへの登録

DI コンテナが解決できるように、`gateways[]` **と** `providers[]` の両方にゲートウェイを追加します：

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

## ハンドラーデコレーター

| デコレーター | Elysia フック | 引数 |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

3つすべてオプションです — 宣言されたハンドラーのみが登録されます。

## ゲートウェイオプション

`@WebSocketGateway` の第2引数に任意の Elysia `ws()` オプションを渡せます：

```typescript
import { t } from "elysia";

@WebSocketGateway("/ws/secure", {
  query: t.Object({ token: t.String() }),
})
export class SecureGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const { token } = ws.data.query;
    // トークンを検証...
  }
}
```

## 依存性注入

ゲートウェイはコンストラクターインジェクションを完全にサポートしています。同じモジュール（またはインポートされたグローバルモジュール）に登録されたプロバイダーを注入できます：

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

## ガード（Guards）

ゲートウェイクラスの `@UseGuards()` は **WebSocket アップグレードの前**（Elysia の `beforeHandle`）に実行されます。ガードが `false` を返すと、接続が確立される前に **403 Forbidden** で拒否されます。

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("認証済みです");
  }
}
```

ガード内では `context.getType()` が `"ws"` を返し、`context.switchToHttp().getRequest()` が HTTP アップグレードリクエストを返すので、ヘッダーやクッキーを検査できます：

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // WebSocket ゲートウェイの場合 context.getType() === "ws"
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers.get("authorization") !== null;
  }
}
```

## ElysiaWsContext

`ElysiaWsContext` は Elysia の `ElysiaWS` を緩い型引数で再エクスポートしたものです：

```typescript
ws.send(data)       // クライアントにメッセージを送信
ws.close()          // 接続を閉じる
ws.data             // query、headers、その他のコンテキストデータ
ws.data.query       // 検証済みクエリパラメーター（スキーマが指定された場合）
```

## リクエストパイプライン

```
HTTP アップグレードリクエスト
  → beforeHandle（ここでガードが実行される）
  → WebSocket 接続確立
  → open ハンドラー
  → message ハンドラー（メッセージごと）
  → close ハンドラー
```
