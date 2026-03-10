# Function: OnEvent()

```ts
function OnEvent(event, options?): MethodDecorator;
```

Defined in: [packages/event-emitter/src/decorators/on-event.decorator.ts:48](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/decorators/on-event.decorator.ts#L48)

Marks a method as a listener for the given event (or wildcard pattern).

The method is automatically registered during `onApplicationBootstrap` by
`EventEmitterExplorer` — no extra wiring is required.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` \| `symbol` | Event name, wildcard pattern (`"order.*"`, `"**"`), or symbol. |
| `options` | [`OnEventOptions`](../interfaces/OnEventOptions.md) | Optional configuration. |

## Returns

`MethodDecorator`

## Example

```typescript
@Injectable()
export class NotificationListener {
  @OnEvent('order.created')
  handleOrderCreated(order: Order) {
    console.log('New order:', order.id);
  }

  @OnEvent('order.*')
  handleAnyOrderEvent(payload: unknown) {
    console.log('Order event fired');
  }
}
```

## Public Api
