# Interface: AsyncIteratorOptions

Defined in: [packages/graphql-pubsub/src/interfaces.ts:56](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L56)

Options for [RedisPubSub.asyncIterator](../classes/RedisPubSub.md#asynciterator) / [PubSubAsyncIterator](../classes/PubSubAsyncIterator.md).

Extends [SubscriptionOptions](SubscriptionOptions.md) with iterator-level defensive
knobs that are not propagated to the pubsub engine itself.

## Extends

- [`SubscriptionOptions`](SubscriptionOptions.md)

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| <a id="idletimeoutms"></a> `idleTimeoutMs?` | `number` | When set to a positive number, the iterator auto-returns (unsubscribing and releasing its entry from the pubsub's `subscriptionMap`) if no message is received for this many milliseconds. Defensive guardrail for edge cases where the WebSocket handler fails to call `iter.return()` on client disconnect. Disabled by default so existing semantics are preserved. Typical value: `5 * 60 * 1000` (5 minutes) for long-lived but not truly eternal subscriptions. | - | [packages/graphql-pubsub/src/interfaces.ts:69](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L69) |
| <a id="pattern"></a> `pattern?` | `boolean` | When `true`, use Redis pattern-subscribe (`PSUBSCRIBE`) instead of `SUBSCRIBE`. | [`SubscriptionOptions`](SubscriptionOptions.md).[`pattern`](SubscriptionOptions.md#pattern) | [packages/graphql-pubsub/src/interfaces.ts:47](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L47) |
