# Interface: CallHandler\<T\>

Defined in: [packages/core/src/interceptors/interceptor.interface.ts:31](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interceptors/interceptor.interface.ts#L31)

Call handler interface for interceptors

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `any` |

## Methods

### handle()

```ts
handle(): Observable<T>;
```

Defined in: [packages/core/src/interceptors/interceptor.interface.ts:35](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interceptors/interceptor.interface.ts#L35)

Returns an Observable representing the response stream

#### Returns

`Observable`\<`T`\>
