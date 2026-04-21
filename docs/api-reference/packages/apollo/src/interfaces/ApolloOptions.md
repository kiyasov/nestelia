# Interface: ApolloOptions\<TContext\>

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:192](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L192)

Options for configuring the GraphQL / Apollo module.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` | `unknown` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="autoschemafile"></a> `autoSchemaFile?` | `string` \| `boolean` | When `true`, generates schema from code-first decorators in memory. When a string path is provided, also writes the SDL to that file. | [packages/apollo/src/interfaces/apollo-options.interface.ts:218](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L218) |
| <a id="buildschemaoptions"></a> `buildSchemaOptions?` | [`BuildSchemaOptions`](BuildSchemaOptions.md) | Additional options used while building code-first schema. | [packages/apollo/src/interfaces/apollo-options.interface.ts:220](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L220) |
| <a id="context"></a> `context?` | (`context`) => `TContext` \| `Promise`\<`TContext`\> | Context factory called for every request. | [packages/apollo/src/interfaces/apollo-options.interface.ts:202](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L202) |
| <a id="formaterror"></a> `formatError?` | (`formattedError`, `error`) => `GraphQLFormattedError` | Custom error formatter. | [packages/apollo/src/interfaces/apollo-options.interface.ts:206](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L206) |
| <a id="path"></a> `path?` | `string` | GraphQL endpoint path. **Default** `'/graphql'` | [packages/apollo/src/interfaces/apollo-options.interface.ts:194](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L194) |
| <a id="playground"></a> `playground?` | `boolean` | Enable Apollo Studio Sandbox landing page. **Default** `true in development` | [packages/apollo/src/interfaces/apollo-options.interface.ts:204](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L204) |
| <a id="plugins"></a> `plugins?` | `ApolloServerPlugin`\<`BaseContext`\>[] | Additional Apollo Server plugins. | [packages/apollo/src/interfaces/apollo-options.interface.ts:224](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L224) |
| <a id="resolvers"></a> `resolvers?` | `Record`\<`string`, `unknown`\> \| `Record`\<`string`, `unknown`\>[] | Resolver map. Used together with `typeDefs`. | [packages/apollo/src/interfaces/apollo-options.interface.ts:200](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L200) |
| <a id="schema"></a> `schema?` | [`GraphQLSchema`](../classes/GraphQLSchema.md) | Pre-built GraphQL schema. Mutually exclusive with `autoSchemaFile`. | [packages/apollo/src/interfaces/apollo-options.interface.ts:196](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L196) |
| <a id="sortschema"></a> `sortSchema?` | `boolean` | Sort schema fields alphabetically. | [packages/apollo/src/interfaces/apollo-options.interface.ts:222](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L222) |
| <a id="subscriptions"></a> `subscriptions?` | `boolean` \| [`SubscriptionConfig`](../type-aliases/SubscriptionConfig.md) | Enable WebSocket subscriptions or pass graphql-ws options. | [packages/apollo/src/interfaces/apollo-options.interface.ts:211](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L211) |
| <a id="subscriptionspath"></a> `subscriptionsPath?` | `string` | WebSocket endpoint for subscriptions. | [packages/apollo/src/interfaces/apollo-options.interface.ts:213](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L213) |
| <a id="typedefs"></a> `typeDefs?` | `string` \| `string`[] | SDL type definitions. Used together with `resolvers`. | [packages/apollo/src/interfaces/apollo-options.interface.ts:198](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L198) |
| <a id="upload"></a> `upload?` | [`UploadOptions`](UploadOptions.md) | File upload limits for multipart requests. | [packages/apollo/src/interfaces/apollo-options.interface.ts:226](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L226) |
