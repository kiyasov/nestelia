# Interface: RequestOptions\<T\>

Defined in: [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:269](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L269)

RPC Request options for AmqpConnection.request()

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

## Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="correlationid"></a> `correlationId?` | `string` | Custom correlation ID (auto-generated if not provided) | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:281](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L281) |
| <a id="exchange"></a> `exchange` | `string` | Exchange to publish to | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:271](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L271) |
| <a id="headers"></a> `headers?` | `Record`\<`string`, `unknown`\> | Custom headers | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:279](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L279) |
| <a id="payload"></a> `payload` | `T` | Payload to send | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:275](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L275) |
| <a id="routingkey"></a> `routingKey` | `string` | Routing key | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:273](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L273) |
| <a id="timeout"></a> `timeout?` | `number` | Request timeout in milliseconds | [packages/rabbitmq/src/interfaces/rabbitmq.interface.ts:277](https://github.com/nestelia/nestelia/blob/main/packages/rabbitmq/src/interfaces/rabbitmq.interface.ts#L277) |
