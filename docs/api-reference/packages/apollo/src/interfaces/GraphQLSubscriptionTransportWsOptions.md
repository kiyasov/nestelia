# Interface: GraphQLSubscriptionTransportWsOptions

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:170](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L170)

Options for legacy subscriptions-transport-ws protocol.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="keepalive"></a> `keepAlive?` | `number` | Keep-alive interval in milliseconds. | [packages/apollo/src/interfaces/apollo-options.interface.ts:174](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L174) |
| <a id="onconnect"></a> `onConnect?` | (`connectionParams?`) => `unknown` | Callback when a client connects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:176](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L176) |
| <a id="ondisconnect"></a> `onDisconnect?` | () => `void` | Callback when a client disconnects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:178](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L178) |
| <a id="onoperation"></a> `onOperation?` | (`message`, `params`) => `unknown` | Callback for each operation. | [packages/apollo/src/interfaces/apollo-options.interface.ts:180](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L180) |
| <a id="path"></a> `path?` | `string` | WebSocket endpoint path. | [packages/apollo/src/interfaces/apollo-options.interface.ts:172](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L172) |
