# Class: EventEmitterModule

Defined in: [packages/event-emitter/src/event-emitter.module.ts:57](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/event-emitter.module.ts#L57)

Module that integrates a typed, wildcard-capable event emitter into nestelia's
dependency injection system.

Register once at the application root and inject `EventEmitter2` anywhere.
Methods decorated with `@OnEvent()` on any provider are automatically wired
up during bootstrap — no manual registration needed.

## Examples

```typescript
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true })],
})
export class AppModule {}
```

Emitting events:
```typescript
@Injectable()
export class OrderService {
  constructor(private readonly events: EventEmitter2) {}

  async placeOrder(order: Order) {
    await this.events.emitAsync('order.created', order);
  }
}
```

Listening to events:
```typescript
@Injectable()
export class NotificationService {
  @OnEvent('order.created')
  handleOrderCreated(order: Order) {
    console.log('Sending confirmation to', order.email);
  }

  @OnEvent('order.*')
  handleAnyOrderEvent(payload: unknown) {
    console.log('An order event fired');
  }
}
```

## Public Api

## Constructors

### Constructor

```ts
new EventEmitterModule(): EventEmitterModule;
```

#### Returns

`EventEmitterModule`

## Methods

### forRoot()

```ts
static forRoot(options?): DynamicModule;
```

Defined in: [packages/event-emitter/src/event-emitter.module.ts:63](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/event-emitter.module.ts#L63)

Configure and register the `EventEmitterModule`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`EventEmitterModuleOptions`](../interfaces/EventEmitterModuleOptions.md) | Optional configuration. |

#### Returns

[`DynamicModule`](../../../../index/interfaces/DynamicModule.md)
