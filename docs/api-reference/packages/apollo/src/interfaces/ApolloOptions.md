# Interface: ApolloOptions\<TContext\>

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:159](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L159)

Options for configuring the GraphQL / Apollo module.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` | `unknown` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="autoschemafile"></a> `autoSchemaFile?` | `string` \| `boolean` | When `true`, generates schema from code-first decorators in memory. When a string path is provided, also writes the SDL to that file. | [packages/apollo/src/interfaces/apollo-options.interface.ts:185](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L185) |
| <a id="buildschemaoptions"></a> `buildSchemaOptions?` | [`BuildSchemaOptions`](BuildSchemaOptions.md) | Additional options used while building code-first schema. | [packages/apollo/src/interfaces/apollo-options.interface.ts:187](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L187) |
| <a id="context"></a> `context?` | (`context`) => `TContext` \| `Promise`\<`TContext`\> | Context factory called for every request. | [packages/apollo/src/interfaces/apollo-options.interface.ts:169](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L169) |
| <a id="formaterror"></a> `formatError?` | (`formattedError`, `error`) => `GraphQLFormattedError` | Custom error formatter. | [packages/apollo/src/interfaces/apollo-options.interface.ts:173](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L173) |
| <a id="path"></a> `path?` | `string` | GraphQL endpoint path. **Default** `'/graphql'` | [packages/apollo/src/interfaces/apollo-options.interface.ts:161](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L161) |
| <a id="playground"></a> `playground?` | `boolean` | Enable Apollo Studio Sandbox landing page. **Default** `true in development` | [packages/apollo/src/interfaces/apollo-options.interface.ts:171](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L171) |
| <a id="plugins"></a> `plugins?` | `ApolloServerPlugin`\<`BaseContext`\>[] | Additional Apollo Server plugins. | [packages/apollo/src/interfaces/apollo-options.interface.ts:191](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L191) |
| <a id="resolvers"></a> `resolvers?` | `Record`\<`string`, `unknown`\> \| `Record`\<`string`, `unknown`\>[] | Resolver map. Used together with `typeDefs`. | [packages/apollo/src/interfaces/apollo-options.interface.ts:167](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L167) |
| <a id="schema"></a> `schema?` | [`GraphQLSchema`](../classes/GraphQLSchema.md) | Pre-built GraphQL schema. Mutually exclusive with `autoSchemaFile`. | [packages/apollo/src/interfaces/apollo-options.interface.ts:163](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L163) |
| <a id="sortschema"></a> `sortSchema?` | `boolean` | Sort schema fields alphabetically. | [packages/apollo/src/interfaces/apollo-options.interface.ts:189](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L189) |
| <a id="subscriptions"></a> `subscriptions?` | `boolean` \| [`SubscriptionConfig`](../type-aliases/SubscriptionConfig.md) | Enable WebSocket subscriptions or pass graphql-ws options. | [packages/apollo/src/interfaces/apollo-options.interface.ts:178](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L178) |
| <a id="subscriptionspath"></a> `subscriptionsPath?` | `string` | WebSocket endpoint for subscriptions. | [packages/apollo/src/interfaces/apollo-options.interface.ts:180](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L180) |
| <a id="typedefs"></a> `typeDefs?` | `string` \| `string`[] | SDL type definitions. Used together with `resolvers`. | [packages/apollo/src/interfaces/apollo-options.interface.ts:165](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L165) |
| <a id="upload"></a> `upload?` | [`UploadOptions`](UploadOptions.md) | File upload limits for multipart requests. | [packages/apollo/src/interfaces/apollo-options.interface.ts:193](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L193) |
