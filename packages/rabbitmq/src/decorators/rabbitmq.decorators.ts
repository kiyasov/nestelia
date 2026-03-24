
import type {
  RabbitRPCOptions,
  RabbitSubscribeOptions,
} from "../interfaces/rabbitmq.interface";

export const RABBIT_SUBSCRIBE_METADATA = "__rabbitSubscribe__";
export const RABBIT_RPC_METADATA = "__rabbitRPC__";

/**
 * Decorator to subscribe to RabbitMQ messages
 *
 * @param options Subscription options
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class OrdersService {
 *   @RabbitSubscribe({
 *     exchange: 'orders',
 *     routingKey: 'order.created',
 *     queue: 'orders-queue',
 *   })
 *   async handleOrderCreated(message: RabbitMQMessage<Order>) {
 *     console.log('Order created:', message.content);
 *     message.ack();
 *   }
 * }
 * ```
 */
export function RabbitSubscribe(
  options: RabbitSubscribeOptions,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const existingHandlers =
      Reflect.getMetadata(RABBIT_SUBSCRIBE_METADATA, target.constructor) || [];

    Reflect.defineMetadata(
      RABBIT_SUBSCRIBE_METADATA,
      [
        ...existingHandlers,
        {
          methodName: propertyKey,
          options,
        },
      ],
      target.constructor,
    );
  };
}

/**
 * Decorator for RabbitMQ RPC handlers
 *
 * @param options RPC options
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class CalculatorService {
 *   @RabbitRPC({
 *     exchange: 'rpc',
 *     routingKey: 'calculator.add',
 *     queue: 'calculator-queue',
 *   })
 *   async add(data: { a: number; b: number }) {
 *     return { result: data.a + data.b };
 *   }
 * }
 * ```
 */
export function RabbitRPC(options: RabbitRPCOptions): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const existingHandlers =
      Reflect.getMetadata(RABBIT_RPC_METADATA, target.constructor) || [];

    Reflect.defineMetadata(
      RABBIT_RPC_METADATA,
      [
        ...existingHandlers,
        {
          methodName: propertyKey,
          options,
        },
      ],
      target.constructor,
    );
  };
}

/**
 * Inject RabbitMQ connection
 */
export function InjectRabbitMQ(): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // In a real implementation, this would inject the amqp.Connection
    // For now, it's a placeholder for future DI integration
  };
}

/**
 * Inject RabbitMQ channel
 */
export function InjectRabbitMQChannel(): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // In a real implementation, this would inject the amqp.Channel
    // For now, it's a placeholder for future DI integration
  };
}

/**
 * Inject RabbitMQ connection name
 * Useful when multiple connections are configured
 */
export function InjectRabbitMQConnection(
  connectionName: string,
): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    // Placeholder for named connection injection
  };
}

/**
 * Decorator to mark a class as a RabbitMQ handler
 * Scans the class for @RabbitSubscribe and @RabbitRPC decorators
 */
export function RabbitHandler(): ClassDecorator {
  return (target: object) => {
    // Mark the class for automatic handler registration
    Reflect.defineMetadata("__rabbitHandler__", true, target);
  };
}

/**
 * Decorator for consumer error handlers
 */
export function RabbitErrorHandler(): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata("__rabbitErrorHandler__", propertyKey, target);
  };
}

/**
 * Decorator for message interceptors/transformers
 */
export function RabbitInterceptor(): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const existingInterceptors =
      Reflect.getMetadata("__rabbitInterceptors__", target.constructor) || [];

    Reflect.defineMetadata(
      "__rabbitInterceptors__",
      [...existingInterceptors, propertyKey],
      target.constructor,
    );
  };
}

/**
 * Decorator to configure retry behavior for a specific handler
 */
export function RabbitRetry(attempts: number, delay: number): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(
      "__rabbitRetry__",
      { attempts, delay },
      target,
      propertyKey,
    );
  };
}

/**
 * Decorator to mark a method for batch processing
 */
export function RabbitBatch(
  batchSize: number,
  flushTimeout?: number,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(
      "__rabbitBatch__",
      { batchSize, flushTimeout },
      target,
      propertyKey,
    );
  };
}

/**
 * Decorator to configure dead letter queue behavior
 */
export function RabbitDLQ(
  exchange: string,
  routingKey: string,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(
      "__rabbitDLQ__",
      { exchange, routingKey },
      target,
      propertyKey,
    );
  };
}

/**
 * Decorator to configure message priority
 */
export function RabbitPriority(priority: number): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata("__rabbitPriority__", priority, target, propertyKey);
  };
}

/**
 * Decorator to set message TTL
 */
export function RabbitTTL(ttl: number): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata("__rabbitTTL__", ttl, target, propertyKey);
  };
}

/**
 * Decorator to configure queue arguments
 */
export function RabbitQueueArguments(
  arguments_: Record<string, unknown>,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const existingArgs =
      Reflect.getMetadata("__rabbitQueueArgs__", target, propertyKey) || {};

    Reflect.defineMetadata(
      "__rabbitQueueArgs__",
      { ...existingArgs, ...arguments_ },
      target,
      propertyKey,
    );
  };
}

/**
 * Decorator for connection-aware handlers
 * Useful when using multiple RabbitMQ connections
 */
export function RabbitConnection(connectionName: string): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata("__rabbitConnection__", connectionName, target);
  };
}

// Metadata keys for parameter decorators
export const RABBIT_PAYLOAD_METADATA = "__rabbitPayload__";
export const RABBIT_HEADER_METADATA = "__rabbitHeader__";
export const RABBIT_REQUEST_METADATA = "__rabbitRequest__";

// Parameter types (matching golevelup constants)
export const RABBIT_PARAM_TYPE = 3;
export const RABBIT_HEADER_TYPE = 4;
export const RABBIT_REQUEST_TYPE = 5;

/**
 * Parameter decorator to extract the message payload.
 * Supports optional property key for nested extraction.
 *
 * @example
 * ```typescript
 * @RabbitSubscribe({ exchange: 'orders', routingKey: 'order.created', queue: 'q' })
 * async handleOrder(@RabbitPayload() data: OrderData) { }
 *
 * // Extract specific property
 * async handleOrder(@RabbitPayload('orderId') id: string) { }
 * ```
 */
export function RabbitPayload(): ParameterDecorator;
export function RabbitPayload(propertyKey: string): ParameterDecorator;
export function RabbitPayload(propertyKey?: string): ParameterDecorator {
  return (
    target: object,
    propertyName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    const existingParams =
      Reflect.getMetadata(RABBIT_PAYLOAD_METADATA, target, propertyName!) || [];
    existingParams.push({ index: parameterIndex, propertyKey, type: RABBIT_PARAM_TYPE });
    Reflect.defineMetadata(RABBIT_PAYLOAD_METADATA, existingParams, target, propertyName!);
  };
}

/**
 * Parameter decorator to extract message headers.
 * Supports optional property key for specific header extraction.
 *
 * @example
 * ```typescript
 * @RabbitSubscribe({ exchange: 'orders', routingKey: 'order.created', queue: 'q' })
 * async handleOrder(@RabbitHeader() headers: Record<string, unknown>) { }
 *
 * // Extract specific header
 * async handleOrder(@RabbitHeader('x-request-id') requestId: string) { }
 * ```
 */
export function RabbitHeader(): ParameterDecorator;
export function RabbitHeader(propertyKey: string): ParameterDecorator;
export function RabbitHeader(propertyKey?: string): ParameterDecorator {
  return (
    target: object,
    propertyName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    const existingParams =
      Reflect.getMetadata(RABBIT_HEADER_METADATA, target, propertyName!) || [];
    existingParams.push({ index: parameterIndex, propertyKey, type: RABBIT_HEADER_TYPE });
    Reflect.defineMetadata(RABBIT_HEADER_METADATA, existingParams, target, propertyName!);
  };
}

/**
 * Parameter decorator to extract the raw ConsumeMessage.
 * Supports optional property key for specific property extraction.
 *
 * @example
 * ```typescript
 * @RabbitSubscribe({ exchange: 'orders', routingKey: 'order.created', queue: 'q' })
 * async handleOrder(@RabbitRequest() msg: ConsumeMessage) { }
 *
 * // Extract specific property
 * async handleOrder(@RabbitRequest('fields') fields: MessageFields) { }
 * ```
 */
export function RabbitRequest(): ParameterDecorator;
export function RabbitRequest(propertyKey: string): ParameterDecorator;
export function RabbitRequest(propertyKey?: string): ParameterDecorator {
  return (
    target: object,
    propertyName: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    const existingParams =
      Reflect.getMetadata(RABBIT_REQUEST_METADATA, target, propertyName!) || [];
    existingParams.push({ index: parameterIndex, propertyKey, type: RABBIT_REQUEST_TYPE });
    Reflect.defineMetadata(RABBIT_REQUEST_METADATA, existingParams, target, propertyName!);
  };
}
