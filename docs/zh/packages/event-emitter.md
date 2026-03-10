---
title: Event Emitter
icon: zap
description: 支持通配符和依赖注入的类型安全事件发射器
---

Event Emitter 模块提供类型安全、支持异步的事件系统，并可选地支持通配符模式匹配。使用 `@OnEvent()` 装饰的方法会在启动时自动被发现和注册，无需手动注册。

## 安装

无需额外依赖——该模块已包含在 `nestelia` 中。

## 配置

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // 启用 "order.*" 和 "**" 模式
      global: true,    // 使 EventEmitter2 全局可用
    }),
  ],
})
export class AppModule {}
```

## 发送事件

注入 `EventEmitter2` 并调用 `emitAsync`（等待所有处理器）或 `emit`（即发即忘）：

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

## 监听事件

在任意 `@Injectable()` 提供者的方法上添加 `@OnEvent()`。模块会在 `onApplicationBootstrap` 期间自动扫描所有提供者并注册处理器。

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("新订单:", order.id);
  }

  @OnEvent("order.*")
  handleAnyOrderEvent(order: Order) {
    console.log("订单事件触发");
  }
}
```

## 通配符模式

在 `forRoot` 中启用 `wildcard: true` 以使用 glob 风格的模式：

| 模式 | 匹配 |
|------|------|
| `order.*` | `order.created`、`order.shipped` … |
| `**` | 所有事件 |

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `wildcard` | `boolean` | `false` | 启用通配符匹配 |
| `delimiter` | `string` | `"."` | 命名空间分隔符 |
| `maxListeners` | `number` | `10` | 每个事件的最大监听器数 |
| `global` | `boolean` | `false` | 注册为全局模块 |

## 导出

| 导出 | 描述 |
|------|------|
| `EventEmitterModule` | 模块类 |
| `EventEmitter2` | 可注入的事件发射器服务 |
| `OnEvent(event, opts?)` | 事件处理方法装饰器 |
| `InjectEventEmitter()` | 参数装饰器简写 |
| `EVENT_EMITTER_TOKEN` | 注入令牌 |
