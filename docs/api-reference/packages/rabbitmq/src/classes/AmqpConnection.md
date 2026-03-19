# Class: AmqpConnection

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:44](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L44)

RabbitMQ connection class for publishing and consuming messages
This is the main class for RabbitMQ operations

## Constructors

### Constructor

```ts
new AmqpConnection(config, logger): AmqpConnection;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:63](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L63)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`RabbitMQConfig`](../interfaces/RabbitMQConfig.md) |
| `logger` | [`Logger`](../../../../index/classes/Logger.md) |

#### Returns

`AmqpConnection`

## Methods

### assertExchange()

```ts
assertExchange(config): Promise<void>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:312](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L312)

Assert an exchange.
When createIfNotExists is false, uses checkExchange (passive declare).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`RabbitMQExchangeConfig`](../interfaces/RabbitMQExchangeConfig.md) |

#### Returns

`Promise`\<`void`\>

***

### assertQueue()

```ts
assertQueue(config): Promise<void>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:340](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L340)

Assert a queue

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `config` | [`RabbitMQQueueConfig`](../interfaces/RabbitMQQueueConfig.md) |

#### Returns

`Promise`\<`void`\>

***

### connect()

```ts
connect(): Promise<void>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:104](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L104)

Connect to RabbitMQ

#### Returns

`Promise`\<`void`\>

***

### disconnect()

```ts
disconnect(): Promise<void>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:248](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L248)

Disconnect from RabbitMQ

#### Returns

`Promise`\<`void`\>

***

### getChannel()

```ts
getChannel(): Channel | null;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:553](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L553)

Get the consumer channel (for consuming messages)

#### Returns

`Channel` \| `null`

***

### getConnection()

```ts
getConnection(): ChannelModel | null;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:567](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L567)

Get the underlying connection (for advanced usage)

#### Returns

`ChannelModel` \| `null`

***

### getLogger()

```ts
getLogger(): Logger;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:546](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L546)

Get the logger instance

#### Returns

[`Logger`](../../../../index/classes/Logger.md)

***

### getPublisherChannel()

```ts
getPublisherChannel(): Channel | null;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:560](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L560)

Get the publisher channel (for publishing messages)

#### Returns

`Channel` \| `null`

***

### isConnectionReady()

```ts
isConnectionReady(): boolean;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:304](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L304)

Check if connected to RabbitMQ

#### Returns

`boolean`

***

### publish()

```ts
publish<T>(
   exchange, 
   routingKey, 
   message, 
options?): Promise<boolean>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:380](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L380)

Publish a message to an exchange

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `exchange` | `string` |
| `routingKey` | `string` |
| `message` | `T` |
| `options?` | [`RabbitMQPublishOptions`](../interfaces/RabbitMQPublishOptions.md) |

#### Returns

`Promise`\<`boolean`\>

***

### registerHandlers()

```ts
registerHandlers(instance): Promise<void>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:727](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L727)

Register RabbitMQ handlers from a service instance
Scans the instance's class for

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `instance` | `object` | The handler instance with @RabbitSubscribe/@RabbitRPC methods |

#### Returns

`Promise`\<`void`\>

#### Rabbit Subscribe

and

#### Rabbit RPC

decorators
and sets up consumers that invoke the actual methods

#### Example

```typescript
await amqpConnection.registerHandlers(ordersHandlerInstance);
```

***

### request()

```ts
request<T, R>(options): Promise<R>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:589](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L589)

Make an RPC request and wait for a response
This method creates a temporary reply queue, sends the request, and waits for a response

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |
| `R` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RequestOptions`](../interfaces/RequestOptions.md)\<`T`\> | Request options including exchange, routingKey, and payload |

#### Returns

`Promise`\<`R`\>

Promise that resolves with the response

#### Example

```typescript
const response = await amqpConnection.request({
  exchange: 'rpc',
  routingKey: 'calculator.add',
  payload: { a: 1, b: 2 },
  timeout: 10000,
});
console.log(response); // { result: 3 }
```

***

### sendToQueue()

```ts
sendToQueue<T>(
   queue, 
   message, 
options?): Promise<boolean>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:414](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L414)

Send a message directly to a queue

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `queue` | `string` |
| `message` | `T` |
| `options?` | [`RabbitMQPublishOptions`](../interfaces/RabbitMQPublishOptions.md) |

#### Returns

`Promise`\<`boolean`\>

***

### subscribe()

```ts
subscribe<T>(
   queue, 
   handler, 
options?): Promise<string>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:445](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L445)

Subscribe to messages from a queue

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `queue` | `string` |
| `handler` | (`message`) => `void` \| `Promise`\<`void`\> |
| `options?` | \{ `consumerTag?`: `string`; `noAck?`: `boolean`; \} |
| `options.consumerTag?` | `string` |
| `options.noAck?` | `boolean` |

#### Returns

`Promise`\<`string`\>

***

### unsubscribe()

```ts
unsubscribe(consumerTag): Promise<void>;
```

Defined in: [packages/rabbitmq/src/connection/amqp-connection.ts:484](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/connection/amqp-connection.ts#L484)

Cancel a consumer subscription

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `consumerTag` | `string` |

#### Returns

`Promise`\<`void`\>
