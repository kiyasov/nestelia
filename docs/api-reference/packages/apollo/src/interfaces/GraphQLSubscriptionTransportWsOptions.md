# Interface: GraphQLSubscriptionTransportWsOptions

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:137](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L137)

Options for legacy subscriptions-transport-ws protocol.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="keepalive"></a> `keepAlive?` | `number` | Keep-alive interval in milliseconds. | [packages/apollo/src/interfaces/apollo-options.interface.ts:141](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L141) |
| <a id="onconnect"></a> `onConnect?` | (`connectionParams?`) => `unknown` | Callback when a client connects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:143](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L143) |
| <a id="ondisconnect"></a> `onDisconnect?` | () => `void` | Callback when a client disconnects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:145](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L145) |
| <a id="onoperation"></a> `onOperation?` | (`message`, `params`) => `unknown` | Callback for each operation. | [packages/apollo/src/interfaces/apollo-options.interface.ts:147](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L147) |
| <a id="path"></a> `path?` | `string` | WebSocket endpoint path. | [packages/apollo/src/interfaces/apollo-options.interface.ts:139](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L139) |
