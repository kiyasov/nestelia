# Type Alias: SubscriptionConfig

```ts
type SubscriptionConfig = {
  graphql-ws?:   | GraphQLWsSubscriptionsOptions
     | boolean;
  subscriptions-transport-ws?:   | GraphQLSubscriptionTransportWsOptions
     | boolean;
};
```

Defined in: [packages/apollo/src/interfaces/apollo-options.interface.ts:151](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L151)

Subscription configuration supporting multiple protocols.

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="graphql-ws"></a> `graphql-ws?` | \| [`GraphQLWsSubscriptionsOptions`](../interfaces/GraphQLWsSubscriptionsOptions.md) \| `boolean` | [packages/apollo/src/interfaces/apollo-options.interface.ts:152](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L152) |
| <a id="subscriptions-transport-ws"></a> `subscriptions-transport-ws?` | \| [`GraphQLSubscriptionTransportWsOptions`](../interfaces/GraphQLSubscriptionTransportWsOptions.md) \| `boolean` | [packages/apollo/src/interfaces/apollo-options.interface.ts:153](https://github.com/nestelia/nestelia/blob/main/packages/apollo/src/interfaces/apollo-options.interface.ts#L153) |
