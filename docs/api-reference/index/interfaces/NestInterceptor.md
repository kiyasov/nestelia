# Interface: NestInterceptor\<T, R\>

Defined in: [packages/core/src/interceptors/interceptor.interface.ts:42](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interceptors/interceptor.interface.ts#L42)

Elysia-Nest interceptor interface

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `any` |
| `R` | `any` |

## Methods

### intercept()

```ts
intercept(context, next): Observable<R> | Promise<Observable<R>>;
```

Defined in: [packages/core/src/interceptors/interceptor.interface.ts:48](https://github.com/kiyasov/nestelia/blob/main/packages/core/src/interceptors/interceptor.interface.ts#L48)

Intercept the request/response stream

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | [`ExecutionContext`](ExecutionContext.md) | The execution context |
| `next` | [`CallHandler`](CallHandler.md)\<`T`\> | The call handler |

#### Returns

`Observable`\<`R`\> \| `Promise`\<`Observable`\<`R`\>\>
