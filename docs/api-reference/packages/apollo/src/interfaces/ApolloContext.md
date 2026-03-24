# Interface: ApolloContext

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:197](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L197)

Elysia-specific GraphQL request context.

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="elysiacontext"></a> `elysiaContext` | `unknown` | Original Elysia context. | [packages/apollo/src/interfaces/apollo-options.interface.ts:207](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L207) |
| <a id="params"></a> `params` | `Record`\<`string`, `string`\> | Route parameters. | [packages/apollo/src/interfaces/apollo-options.interface.ts:203](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L203) |
| <a id="request"></a> `request` | `Request` | HTTP request object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:199](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L199) |
| <a id="response"></a> `response` | `Response` | HTTP response object. | [packages/apollo/src/interfaces/apollo-options.interface.ts:201](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L201) |
| <a id="store"></a> `store` | `Record`\<`string`, `unknown`\> | Elysia store. | [packages/apollo/src/interfaces/apollo-options.interface.ts:205](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L205) |
