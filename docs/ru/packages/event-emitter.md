---
title: Event Emitter
icon: zap
description: Типобезопасный эмиттер событий с wildcard-поддержкой и DI-интеграцией
---

Модуль Event Emitter предоставляет типобезопасную, асинхронную систему событий с опциональной поддержкой wildcard-паттернов. Методы, отмеченные `@OnEvent()`, автоматически обнаруживаются и регистрируются при старте приложения — никакой ручной регистрации не требуется.

## Установка

Дополнительные зависимости не нужны — модуль включён в `nestelia`.

## Настройка

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // включить паттерны "order.*" и "**"
      global: true,    // EventEmitter2 доступен везде
    }),
  ],
})
export class AppModule {}
```

## Отправка событий

Инжектируйте `EventEmitter2` и вызывайте `emitAsync` (ожидает все обработчики) или `emit` (fire-and-forget):

```typescript
import { Injectable } from "nestelia";
import { EventEmitter2 } from "nestelia/event-emitter";
import type { Order } from "./order.schema";

@Injectable()
export class OrdersService {
  constructor(private readonly events: EventEmitter2) {}

  async placeOrder(order: Order) {
    // ... сохранение заказа ...
    await this.events.emitAsync("order.created", order);
    return order;
  }
}
```

### @InjectEventEmitter()

Сокращение для `@Inject(EVENT_EMITTER_TOKEN)`:

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

## Прослушивание событий

Добавьте `@OnEvent()` к любому методу любого `@Injectable()`-провайдера. Модуль сканирует все провайдеры во время `onApplicationBootstrap` и регистрирует обработчики автоматически.

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";
import type { Order } from "./order.schema";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("Новый заказ:", order.id);
  }

  @OnEvent("order.shipped")
  handleOrderShipped(order: Order) {
    console.log("Заказ отправлен:", order.id);
  }
}
```

> Зарегистрируйте listener-класс как `provider` в нужном модуле:
> ```typescript
> @Module({ providers: [NotificationListener] })
> export class OrdersModule {}
> ```

### Одноразовые обработчики

```typescript
@OnEvent("app.initialized", { once: true })
onAppReady(payload: unknown) {
  console.log("Приложение готово");
}
```

## Wildcard-паттерны

Включите `wildcard: true` в `forRoot` для использования glob-паттернов:

| Паттерн | Совпадает с |
|---------|-------------|
| `order.*` | `order.created`, `order.shipped`, … |
| `**.created` | `order.created`, `user.created`, … |
| `**` | каждое событие |

```typescript
@Injectable()
export class AuditListener {
  @OnEvent("order.*")
  logOrderEvent(order: Order) {
    console.log("Аудит:", order.id);
  }

  @OnEvent("**")
  logAll(payload: unknown) {
    console.log("Событие:", payload);
  }
}
```

## Конфигурация

### EventEmitterModuleOptions

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `wildcard` | `boolean` | `false` | Включить wildcard-паттерны `*` / `**` |
| `delimiter` | `string` | `"."` | Разделитель пространств имён |
| `maxListeners` | `number` | `10` | Максимум обработчиков на событие |
| `global` | `boolean` | `false` | Зарегистрировать как глобальный модуль |

## API EventEmitter2

| Метод | Сигнатура | Описание |
|-------|-----------|----------|
| `emit` | `(event, payload?) → boolean` | Отправить событие без ожидания |
| `emitAsync` | `(event, payload?) → Promise<unknown[]>` | Отправить и дождаться всех обработчиков |
| `on` | `(event, handler) → this` | Зарегистрировать постоянный обработчик |
| `once` | `(event, handler) → this` | Зарегистрировать одноразовый обработчик |
| `off` | `(event, handler?) → this` | Удалить обработчик |
| `removeAllListeners` | `(event?) → this` | Удалить все обработчики |
| `listenerCount` | `(event) → number` | Количество зарегистрированных обработчиков |

## Экспорты

| Экспорт | Описание |
|---------|----------|
| `EventEmitterModule` | Класс модуля |
| `EventEmitter2` | Инжектируемый сервис эмиттера |
| `OnEvent(event, opts?)` | Декоратор метода для обработчиков |
| `InjectEventEmitter()` | Сокращённый декоратор параметра |
| `EVENT_EMITTER_TOKEN` | Токен инжекции |
| `EventEmitterModuleOptions` | Интерфейс опций |
