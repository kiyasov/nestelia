# Interface: SubscriptionOptions

Defined in: [packages/graphql-pubsub/src/interfaces.ts:45](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L45)

Options passed when subscribing to a trigger.

## Extended by

- [`AsyncIteratorOptions`](AsyncIteratorOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="pattern"></a> `pattern?` | `boolean` | When `true`, use Redis pattern-subscribe (`PSUBSCRIBE`) instead of `SUBSCRIBE`. | [packages/graphql-pubsub/src/interfaces.ts:47](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L47) |
