# Class: PubSubAsyncIterator\<T\>

Defined in: [packages/graphql-pubsub/src/pubsub-async-iterator.ts:30](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/pubsub-async-iterator.ts#L30)

Async iterator for GraphQL subscriptions backed by a [PubSubEngine](../interfaces/PubSubEngine.md).

Implements the `AsyncIterator` / `AsyncIterable` protocols so it can be
used directly in GraphQL resolvers:

```typescript
yield* pubsub.asyncIterator<MyEvent>("MY_EVENT");
```

Internally it maintains two queues:
- **pullQueue** – pending `next()` promises waiting for a message.
- **pushQueue** – messages that arrived before `next()` was called.

To prevent unbounded memory growth the push-queue is capped at
MAX\_QUEUE\_SIZE; oldest entries are dropped when the limit is
exceeded (similar to a lossy channel).

## Type Parameters

| Type Parameter |
| ------ |
| `T` |

## Implements

- `AsyncIterator`\<`T`\>

## Constructors

### Constructor

```ts
new PubSubAsyncIterator<T>(
   pubsub, 
   triggers, 
options?): PubSubAsyncIterator<T>;
```

Defined in: [packages/graphql-pubsub/src/pubsub-async-iterator.ts:53](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/pubsub-async-iterator.ts#L53)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `pubsub` | [`PubSubEngine`](../interfaces/PubSubEngine.md) |
| `triggers` | `string`[] |
| `options?` | [`AsyncIteratorOptions`](../interfaces/AsyncIteratorOptions.md) |

#### Returns

`PubSubAsyncIterator`\<`T`\>

## Methods

### \[asyncIterator\]()

```ts
asyncIterator: AsyncIterator<T>;
```

Defined in: [packages/graphql-pubsub/src/pubsub-async-iterator.ts:111](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/pubsub-async-iterator.ts#L111)

Makes this object usable in `for await…of` loops.

#### Returns

`AsyncIterator`\<`T`\>

***

### next()

```ts
next(): Promise<IteratorResult<T, any>>;
```

Defined in: [packages/graphql-pubsub/src/pubsub-async-iterator.ts:79](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/pubsub-async-iterator.ts#L79)

Returns the next message, waiting if none is buffered yet.

#### Returns

`Promise`\<`IteratorResult`\<`T`, `any`\>\>

#### Implementation of

```ts
AsyncIterator.next
```

***

### return()

```ts
return(): Promise<IteratorResult<T, any>>;
```

Defined in: [packages/graphql-pubsub/src/pubsub-async-iterator.ts:97](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/pubsub-async-iterator.ts#L97)

Terminates the iterator and unsubscribes from all triggers.

#### Returns

`Promise`\<`IteratorResult`\<`T`, `any`\>\>

#### Implementation of

```ts
AsyncIterator.return
```

***

### throw()

```ts
throw(error): Promise<IteratorResult<T, any>>;
```

Defined in: [packages/graphql-pubsub/src/pubsub-async-iterator.ts:104](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/pubsub-async-iterator.ts#L104)

Terminates the iterator, unsubscribes, then re-throws `error`.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |

#### Returns

`Promise`\<`IteratorResult`\<`T`, `any`\>\>

#### Implementation of

```ts
AsyncIterator.throw
```
