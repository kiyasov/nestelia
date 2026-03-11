# Interface: OnEventMetadata

Defined in: [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:47](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L47)

**`Internal`**

Metadata stored per `@OnEvent` decorated method.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="event"></a> `event` | `string` \| `symbol` | Event name or pattern. | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:49](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L49) |
| <a id="methodname"></a> `methodName` | `string` \| `symbol` | Method name on the class. | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:51](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L51) |
| <a id="once"></a> `once` | `boolean` | Whether the handler should fire only once. | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:53](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L53) |
