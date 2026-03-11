# Class: HttpAdapterHost

Defined in: [packages/core/src/core/http-adapter.ts:19](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/core/http-adapter.ts#L19)

Host class for accessing the HTTP adapter.
Used to abstract the underlying HTTP server.

## Accessors

### httpAdapter

#### Get Signature

```ts
get httpAdapter(): HttpAdapter | undefined;
```

Defined in: [packages/core/src/core/http-adapter.ts:25](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/core/http-adapter.ts#L25)

Get the HTTP adapter instance

##### Returns

[`HttpAdapter`](../interfaces/HttpAdapter.md) \| `undefined`

#### Set Signature

```ts
set httpAdapter(adapter): void;
```

Defined in: [packages/core/src/core/http-adapter.ts:32](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/core/http-adapter.ts#L32)

Set the HTTP adapter instance

##### Parameters

| Parameter | Type |
| ------ | ------ |
| `adapter` | [`HttpAdapter`](../interfaces/HttpAdapter.md) \| `undefined` |

##### Returns

`void`

## Constructors

### Constructor

```ts
new HttpAdapterHost(): HttpAdapterHost;
```

#### Returns

`HttpAdapterHost`
