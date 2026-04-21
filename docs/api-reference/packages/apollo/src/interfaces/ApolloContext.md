# Interface: ApolloContext

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:230](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L230)

Elysia-specific GraphQL request context.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="elysiacontext"></a> `elysiaContext` | `unknown` | Original Elysia context. | [packages/apollo/src/interfaces/apollo-options.interface.ts:240](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L240) |
| <a id="params"></a> `params` | `Record`\<`string`, `string`\> | Route parameters. | [packages/apollo/src/interfaces/apollo-options.interface.ts:236](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L236) |
| <a id="request"></a> `request` | `Request` | HTTP request object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:232](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L232) |
| <a id="response"></a> `response` | `Response` | HTTP response object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:234](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L234) |
| <a id="store"></a> `store` | `Record`\<`string`, `unknown`\> | Elysia store. | [packages/apollo/src/interfaces/apollo-options.interface.ts:238](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L238) |
