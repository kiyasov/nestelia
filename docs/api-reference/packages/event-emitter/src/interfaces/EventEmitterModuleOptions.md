# Interface: EventEmitterModuleOptions

Defined in: [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:5](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L5)

Options for configuring the EventEmitterModule.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="delimiter"></a> `delimiter?` | `string` | Delimiter used to separate namespaces in event names. **Default** `"."` | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:23](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L23) |
| <a id="global"></a> `global?` | `boolean` | If `true`, registers `EventEmitterModule` as a global module so `EventEmitterService` is available throughout the application without re-importing the module. **Default** `false` | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:39](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L39) |
| <a id="maxlisteners"></a> `maxListeners?` | `number` | Maximum number of listeners per event before a warning is emitted. **Default** `10` | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:30](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L30) |
| <a id="wildcard"></a> `wildcard?` | `boolean` | Enable wildcard matching for event names. When `true`, `*` matches any single segment and `**` matches any number of segments: - `"order.*"` matches `"order.created"`, `"order.shipped"`, etc. - `"**"` matches every event. **Default** `false` | [packages/event-emitter/src/interfaces/event-emitter-options.interface.ts:16](https://github.com/kiyasov/nestelia/blob/main/packages/event-emitter/src/interfaces/event-emitter-options.interface.ts#L16) |
