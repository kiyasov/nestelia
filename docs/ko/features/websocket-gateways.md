---
title: WebSocket 게이트웨이
icon: plug
description: "@WebSocketGateway로 데코레이트된 게이트웨이 클래스로 WebSocket 연결을 처리하기"
---

WebSocket 게이트웨이를 사용하면 HTTP 컨트롤러와 동일한 데코레이터 및 DI 스타일로 실시간 연결을 처리할 수 있습니다. 게이트웨이는 `@WebSocketGateway`로 데코레이트된 클래스로, Elysia의 네이티브 `app.ws()` 엔드포인트에 자신을 등록합니다.

## 게이트웨이 정의

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
    ws.send("연결되었습니다");
  }

  @OnMessage()
  handleMessage(ws: ElysiaWsContext, message: unknown) {
    ws.send(JSON.stringify({ echo: message }));
  }

  @OnClose()
  handleClose(ws: ElysiaWsContext) {
    console.log("클라이언트가 연결을 끊었습니다");
  }
}
```

## 모듈에 등록

DI 컨테이너가 해석할 수 있도록 `gateways[]` **와** `providers[]` 모두에 게이트웨이를 추가하세요:

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

## 핸들러 데코레이터

| 데코레이터 | Elysia 훅 | 인수 |
|---|---|---|
| `@OnOpen()` | `open(ws)` | `ws: ElysiaWsContext` |
| `@OnMessage()` | `message(ws, msg)` | `ws: ElysiaWsContext, message: unknown` |
| `@OnClose()` | `close(ws, code, reason)` | `ws: ElysiaWsContext, code: number, reason: string` |

세 가지 모두 선택 사항입니다 — 선언된 핸들러만 등록됩니다.

## 게이트웨이 옵션

`@WebSocketGateway`의 두 번째 인수로 Elysia `ws()` 옵션을 전달할 수 있습니다:

```typescript
import { t } from "elysia";

@WebSocketGateway("/ws/secure", {
  query: t.Object({ token: t.String() }),
})
export class SecureGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    const { token } = ws.data.query;
    // 토큰 검증...
  }
}
```

## 의존성 주입

게이트웨이는 생성자 주입을 완전히 지원합니다 — 같은 모듈(또는 임포트된 전역 모듈)에 등록된 모든 프로바이더를 주입할 수 있습니다:

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

## 가드(Guards)

게이트웨이 클래스의 `@UseGuards()`는 **WebSocket 업그레이드 전**（Elysia의 `beforeHandle`）에 실행됩니다. 가드가 `false`를 반환하면 연결이 확립되기 전에 **403 Forbidden**으로 거부됩니다.

```typescript
import { UseGuards } from "nestelia";

@Injectable()
@UseGuards(AuthGuard)
@WebSocketGateway("/ws/private")
export class PrivateGateway {
  @OnOpen()
  handleOpen(ws: ElysiaWsContext) {
    ws.send("인증되었습니다");
  }
}
```

가드 내부에서 `context.getType()`은 `"ws"`를 반환하고, `context.switchToHttp().getRequest()`는 HTTP 업그레이드 요청을 반환하므로 헤더와 쿠키를 검사할 수 있습니다:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // WebSocket 게이트웨이의 경우 context.getType() === "ws"
    const req = context.switchToHttp().getRequest<Request>();
    return req.headers.get("authorization") !== null;
  }
}
```

## ElysiaWsContext

`ElysiaWsContext`는 느슨한 제네릭으로 Elysia의 `ElysiaWS`를 재내보내기한 것입니다:

```typescript
ws.send(data)       // 클라이언트에 메시지 전송
ws.close()          // 연결 종료
ws.data             // query, headers 및 기타 컨텍스트 데이터
ws.data.query       // 검증된 쿼리 파라미터 (스키마 제공 시)
```

## 요청 파이프라인

```
HTTP 업그레이드 요청
  → beforeHandle (가드가 여기서 실행됨)
  → WebSocket 연결 수립
  → open 핸들러
  → message 핸들러 (메시지마다)
  → close 핸들러
```
