# Interface: ExecutionContext

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:35](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L35)

Execution context interface providing access to
the request/response and handler information

## Methods

### getArgByIndex()

```ts
getArgByIndex<T>(index): T;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:49](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L49)

Get argument by index

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `any` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `index` | `number` |

#### Returns

`T`

***

### getArgs()

```ts
getArgs<T>(): T;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:54](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L54)

Get all arguments

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `any`[] | `any`[] |

#### Returns

`T`

***

### getClass()

```ts
getClass<T>(): T;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:39](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L39)

Returns the class of the current handler

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `any` |

#### Returns

`T`

***

### getHandler()

```ts
getHandler(): (...args) => unknown;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:44](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L44)

Returns the handler function

#### Returns

```ts
(...args): unknown;
```

##### Parameters

| Parameter | Type |
| ------ | ------ |
| ...`args` | `unknown`[] |

##### Returns

`unknown`

***

### getType()

```ts
getType<TContext>(): TContext;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:59](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L59)

Get type of the context

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `TContext` *extends* `string` | `string` |

#### Returns

`TContext`

***

### switchToHttp()

```ts
switchToHttp(): HttpArgumentsHost;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:64](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L64)

Switch to HTTP context

#### Returns

[`HttpArgumentsHost`](HttpArgumentsHost.md)

***

### switchToRpc()

```ts
switchToRpc(): RpcArgumentsHost;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:69](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L69)

Switch to RPC context

#### Returns

[`RpcArgumentsHost`](RpcArgumentsHost.md)

***

### switchToWs()

```ts
switchToWs(): WsArgumentsHost;
```

Defined in: [packages/core/src/interfaces/execution-context.interface.ts:74](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interfaces/execution-context.interface.ts#L74)

Switch to WebSocket context

#### Returns

[`WsArgumentsHost`](WsArgumentsHost.md)
