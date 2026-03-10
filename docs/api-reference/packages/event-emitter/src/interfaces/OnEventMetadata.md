# Interface: OnEventMetadata

Defined in: [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:48](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L48)

**`Internal`**

Metadata stored per `@OnEvent` decorated method.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="event"></a> `event` | `string` \| `symbol` | Event name or pattern. | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:50](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L50) |
| <a id="methodname"></a> `methodName` | `string` \| `symbol` | Method name on the class. | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:52](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L52) |
| <a id="once"></a> `once` | `boolean` | Whether the handler should fire only once. | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:54](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L54) |
