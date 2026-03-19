# Type Alias: RabbitMQDeserializer()

```ts
type RabbitMQDeserializer = (message, msg) => unknown;
```

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:292](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L292)

Deserializer function type for custom message deserialization

## Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | `Buffer` |
| `msg` | `unknown` |

## Returns

`unknown`
