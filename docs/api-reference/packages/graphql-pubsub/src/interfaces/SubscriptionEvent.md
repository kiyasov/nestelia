# Interface: SubscriptionEvent\<T\>

Defined in: [packages/graphql-pubsub/src/interfaces.ts:91](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L91)

Metadata stored per active subscription.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="handler"></a> `handler` | [`MessageHandler`](../type-aliases/MessageHandler.md)\<`T`\> | Message callback. | [packages/graphql-pubsub/src/interfaces.ts:97](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L97) |
| <a id="id"></a> `id` | `number` | Unique subscription identifier. | [packages/graphql-pubsub/src/interfaces.ts:93](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L93) |
| <a id="ispattern"></a> `isPattern` | `boolean` | Whether this subscription uses Redis pattern-subscribe. | [packages/graphql-pubsub/src/interfaces.ts:99](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L99) |
| <a id="trigger"></a> `trigger` | `string` | Resolved Redis channel / pattern key. | [packages/graphql-pubsub/src/interfaces.ts:95](https://github.com/nestelia/nestelia/blob/main/packages/graphql-pubsub/src/interfaces.ts#L95) |
