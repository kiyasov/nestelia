---
title: Event Emitter
icon: zap
description: 와일드카드 지원과 DI 통합을 갖춘 타입 안전 이벤트 이미터
---

Event Emitter 모듈은 타입 안전하고 비동기를 지원하는 이벤트 시스템을 제공합니다. 선택적으로 와일드카드 패턴 매칭을 활성화할 수 있습니다. `@OnEvent()`로 데코레이팅된 메서드는 부트스트랩 중에 자동으로 감지되고 등록됩니다.

## 설치

추가 의존성이 필요 없습니다 — 모듈은 `nestelia`에 포함되어 있습니다.

## 설정

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // "order.*" 및 "**" 패턴 활성화
      global: true,    // EventEmitter2를 전역으로 사용 가능하게
    }),
  ],
})
export class AppModule {}
```

## 이벤트 발송

`EventEmitter2`를 주입하고 `emitAsync`(모든 핸들러 대기) 또는 `emit`(발송 후 잊기)를 호출합니다:

```typescript
import { Injectable } from "nestelia";
import { EventEmitter2 } from "nestelia/event-emitter";

@Injectable()
export class OrdersService {
  constructor(private readonly events: EventEmitter2) {}

  async placeOrder(order: Order) {
    await this.events.emitAsync("order.created", order);
    return order;
  }
}
```

## 이벤트 수신

임의의 `@Injectable()` 프로바이더의 메서드에 `@OnEvent()`를 추가합니다. 모듈은 `onApplicationBootstrap` 중에 모든 프로바이더를 자동으로 스캔하여 핸들러를 등록합니다.

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("새 주문:", order.id);
  }

  @OnEvent("order.*")
  handleAnyOrderEvent(order: Order) {
    console.log("주문 이벤트 발생");
  }
}
```

## 와일드카드 패턴

`forRoot`에서 `wildcard: true`를 활성화하면 glob 스타일 패턴을 사용할 수 있습니다:

| 패턴 | 매칭 |
|------|------|
| `order.*` | `order.created`, `order.shipped` … |
| `**` | 모든 이벤트 |

## 설정 옵션

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `wildcard` | `boolean` | `false` | 와일드카드 매칭 활성화 |
| `delimiter` | `string` | `"."` | 네임스페이스 구분자 |
| `maxListeners` | `number` | `10` | 이벤트당 최대 리스너 수 |
| `global` | `boolean` | `false` | 전역 모듈로 등록 |

## 내보내기

| 내보내기 | 설명 |
|---------|------|
| `EventEmitterModule` | 모듈 클래스 |
| `EventEmitter2` | 주입 가능한 이벤트 이미터 서비스 |
| `OnEvent(event, opts?)` | 이벤트 핸들러 메서드 데코레이터 |
| `InjectEventEmitter()` | 파라미터 데코레이터 단축키 |
| `EVENT_EMITTER_TOKEN` | 주입 토큰 |
