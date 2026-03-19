# Interface: RabbitSubscribeOptions

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:169](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L169)

Message handler options for

## Rabbit Subscribe

decorator

## Extended by

- [`RabbitRPCOptions`](RabbitRPCOptions.md)

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="allownonjsonmessages"></a> `allowNonJsonMessages?` | `boolean` | Whether to allow non-json messages | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:195](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L195) |
| <a id="errorhandler"></a> `errorHandler?` | (`error`, `message`) => `void` \| `Promise`\<`void`\> | Error handler | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:187](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L187) |
| <a id="exchange"></a> `exchange` | `string` | Exchange name (must be pre-configured in RabbitMQModule.forRoot({ exchanges })) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:171](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L171) |
| <a id="exchangeoptions"></a> `exchangeOptions?` | \{ `arguments?`: `Record`\<`string`, `unknown`\> & \{ `x-delayed-type?`: `"direct"` \| `"topic"` \| `"fanout"` \| `"headers"`; \}; `autoDelete?`: `boolean`; `durable?`: `boolean`; `internal?`: `boolean`; \} | Exchange assert options (e.g. { arguments: { "x-delayed-type": "direct" } }) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:179](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L179) |
| `exchangeOptions.arguments?` | `Record`\<`string`, `unknown`\> & \{ `x-delayed-type?`: `"direct"` \| `"topic"` \| `"fanout"` \| `"headers"`; \} | For x-delayed-message exchange: the underlying type | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:114](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L114) |
| `exchangeOptions.autoDelete?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:111](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L111) |
| `exchangeOptions.durable?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:110](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L110) |
| `exchangeOptions.internal?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:112](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L112) |
| <a id="exchangetype"></a> `exchangeType?` | [`RabbitMQExchangeType`](../type-aliases/RabbitMQExchangeType.md) | Exchange type — required when the exchange is NOT pre-configured via forRoot({ exchanges }). Must be specified for non-default types such as "x-delayed-message" to avoid a 406 PRECONDITION_FAILED error that would silently kill the consumer channel. | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:177](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L177) |
| <a id="queue"></a> `queue?` | `string` | Queue name (auto-generated if not provided) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:183](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L183) |
| <a id="queueoptions"></a> `queueOptions?` | \{ `arguments?`: `Record`\<`string`, `unknown`\>; `autoDelete?`: `boolean`; `durable?`: `boolean`; `exclusive?`: `boolean`; `maxLength?`: `number`; `maxLengthBytes?`: `number`; `messageTtl?`: `number`; \} | Queue options | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:185](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L185) |
| `queueOptions.arguments?` | `Record`\<`string`, `unknown`\> | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:148](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L148) |
| `queueOptions.autoDelete?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:146](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L146) |
| `queueOptions.durable?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:145](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L145) |
| `queueOptions.exclusive?` | `boolean` | - | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:147](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L147) |
| `queueOptions.maxLength?` | `number` | Maximum number of messages in queue | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:152](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L152) |
| `queueOptions.maxLengthBytes?` | `number` | Maximum queue size in bytes | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:154](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L154) |
| `queueOptions.messageTtl?` | `number` | Message TTL in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:150](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L150) |
| <a id="retry"></a> `retry?` | `boolean` | Enable message retry on failure | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:189](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L189) |
| <a id="retryattempts"></a> `retryAttempts?` | `number` | Number of retry attempts | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:191](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L191) |
| <a id="retrydelay"></a> `retryDelay?` | `number` | Retry delay in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:193](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L193) |
| <a id="routingkey"></a> `routingKey` | `string` \| `string`[] | Routing key pattern | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:181](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L181) |
