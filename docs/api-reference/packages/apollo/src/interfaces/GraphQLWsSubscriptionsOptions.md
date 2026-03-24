# Interface: GraphQLWsSubscriptionsOptions

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:92](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L92)

Options for GraphQL WebSocket subscriptions (graphql-ws protocol).

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="connectioninitwaittimeout"></a> `connectionInitWaitTimeout?` | `number` | Timeout for connection initialization in milliseconds. | [packages/apollo/src/interfaces/apollo-options.interface.ts:96](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L96) |
| <a id="keepalive"></a> `keepAlive?` | `number` \| `false` | Server-side keep-alive interval in milliseconds. Sends periodic `ping` messages to prevent idle connections from being closed by proxies, load balancers, or NAT. Set to `0` or `false` to disable. **Default** `12000` | [packages/apollo/src/interfaces/apollo-options.interface.ts:103](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L103) |
| <a id="onclose"></a> `onClose?` | (`context`) => `void` \| `Promise`\<`void`\> | Callback when a connection closes. | [packages/apollo/src/interfaces/apollo-options.interface.ts:115](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L115) |
| <a id="onconnect"></a> `onConnect?` | (`context`) => \| `boolean` \| `void` \| `Record`\<`string`, `unknown`\> \| `Promise`\<`boolean` \| `void` \| `Record`\<`string`, `unknown`\>\> | Callback when a client connects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:105](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L105) |
| <a id="ondisconnect"></a> `onDisconnect?` | (`context`) => `void` \| `Promise`\<`void`\> | Callback when a client disconnects. | [packages/apollo/src/interfaces/apollo-options.interface.ts:113](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L113) |
| <a id="onnext"></a> `onNext?` | (`context`, `id`, `payload`, `args`, `result`) => `void` \| `Promise`\<`void`\> | Callback when a subscription emits a value. | [packages/apollo/src/interfaces/apollo-options.interface.ts:127](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L127) |
| <a id="onsubscribe"></a> `onSubscribe?` | (`context`, `id`, `payload`) => \| `void` \| `ExecutionArgs` \| readonly `GraphQLError`[] \| `Promise`\<`void` \| `ExecutionArgs` \| readonly `GraphQLError`[]\> | Callback when a subscription is created. | [packages/apollo/src/interfaces/apollo-options.interface.ts:117](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L117) |
| <a id="path"></a> `path?` | `string` | WebSocket endpoint path. | [packages/apollo/src/interfaces/apollo-options.interface.ts:94](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L94) |
