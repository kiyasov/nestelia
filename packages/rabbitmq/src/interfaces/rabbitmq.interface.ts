/**
 * RabbitMQ connection configuration (single URL)
 */
export interface RabbitMQConnectionConfig {
  /** RabbitMQ URL (amqp://user:pass@host:port) */
  url: string;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Heartbeat interval in seconds */
  heartbeat?: number;
}

/**
 * Connection initialization options
 */
export interface ConnectionInitOptions {
  /** Timeout for connection initialization in milliseconds */
  timeout?: number;
  /** Heartbeat interval in seconds */
  heartbeatIntervalInSeconds?: number;
  /** Wait for connection to be established before resolving */
  wait?: boolean;
  /** Interval to check connection status in milliseconds */
  interval?: number;
  /** Maximum time to wait for connection in milliseconds */
  maxWaitTime?: number;
}

/**
 * Error behavior for message handlers
 */
export type MessageHandlerErrorBehavior = "ACK" | "NACK" | "REQUEUE" | "REJECT";

/**
 * Channel configuration
 */
export interface RabbitMQChannelConfig {
  /** Prefetch count for this channel */
  prefetchCount?: number;
  /** Default publish exchange */
  default?: boolean;
}

/**
 * RabbitMQ connection configuration
 */
export interface RabbitMQConfig {
  /** RabbitMQ URL (amqp://user:pass@host:port) - single connection */
  uri?: string;
  /** RabbitMQ URLs (amqp://user:pass@host:port) - multiple connections for failover */
  urls?: string[];
  /** Queue prefix for all queues */
  queuePrefix?: string;
  /** Exchange prefix for all exchanges */
  exchangePrefix?: string;
  /** Connection timeout in milliseconds */
  timeout?: number;
  /** Prefetch count (number of messages processed concurrently) */
  prefetchCount?: number;
  /** Enable automatic reconnection */
  reconnect?: boolean;
  /** Reconnection attempts */
  reconnectAttempts?: number;
  /** Reconnection interval in milliseconds */
  reconnectInterval?: number;
  /** Exchanges to assert on connection */
  exchanges?: RabbitMQExchangeConfig[];
  /** Queues to assert on connection */
  queues?: RabbitMQQueueConfig[];
  /** Channel configurations */
  channels?: Record<string, RabbitMQChannelConfig>;
  /** Default error behavior for RPC handlers */
  defaultRpcErrorBehavior?: MessageHandlerErrorBehavior;
  /** Default error behavior for subscribe handlers */
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
  /** Default RPC timeout in milliseconds */
  defaultRpcTimeout?: number;
  /** Connection initialization options */
  connectionInitOptions?: ConnectionInitOptions;
  /** Register handlers automatically */
  registerHandlers?: boolean;
  /** Enable controller discovery */
  enableControllerDiscovery?: boolean;
  /** Maximum message size in bytes (default: 10MB) */
  maxMessageSize?: number;
}

/**
 * RabbitMQ exchange types
 */
export type RabbitMQExchangeType =
  | "direct"
  | "fanout"
  | "topic"
  | "headers"
  | "x-delayed-message";

/**
 * Exchange configuration
 */
export interface RabbitMQExchangeConfig {
  /** Exchange name */
  name: string;
  /** Exchange type */
  type: RabbitMQExchangeType;
  /** Exchange options */
  options?: {
    durable?: boolean;
    autoDelete?: boolean;
    internal?: boolean;
    /** For x-delayed-message exchange: the underlying type */
    arguments?: Record<string, unknown> & {
      "x-delayed-type"?: "direct" | "fanout" | "topic" | "headers";
    };
  };
  /** Create exchange if it doesn't exist */
  createIfNotExists?: boolean;
}

/**
 * Queue binding configuration
 */
export interface RabbitMQQueueBinding {
  /** Exchange name to bind to */
  exchange: string;
  /** Routing pattern */
  routingKey: string;
  /** Binding arguments */
  arguments?: Record<string, unknown>;
}

/**
 * Queue configuration
 */
export interface RabbitMQQueueConfig {
  /** Queue name */
  name: string;
  /** Queue options */
  options?: {
    durable?: boolean;
    autoDelete?: boolean;
    exclusive?: boolean;
    arguments?: Record<string, unknown>;
    /** Message TTL in milliseconds */
    messageTtl?: number;
    /** Maximum number of messages in queue */
    maxLength?: number;
    /** Maximum queue size in bytes */
    maxLengthBytes?: number;
  };
  /** Queue bindings */
  bindings?: RabbitMQQueueBinding[];
  /** Exchange to bind to (shortcut for simple binding) */
  exchange?: string;
  /** Routing key for binding (shortcut for simple binding) */
  routingKey?: string;
  /** Create queue if it doesn't exist */
  createIfNotExists?: boolean;
}

/**
 * Message handler options for @RabbitSubscribe decorator
 */
export interface RabbitSubscribeOptions {
  /** Exchange name */
  exchange: string;
  /** Routing key pattern */
  routingKey: string | string[];
  /** Queue name (auto-generated if not provided) */
  queue?: string;
  /** Queue options */
  queueOptions?: RabbitMQQueueConfig["options"];
  /** Exchange options (if exchange doesn't exist) */
  exchangeOptions?: RabbitMQExchangeConfig["options"];
  /** Error handler */
  errorHandler?: (error: Error, message: unknown) => void | Promise<void>;
  /** Enable message retry on failure */
  retry?: boolean;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Retry delay in milliseconds */
  retryDelay?: number;
  /** Whether to allow non-json messages */
  allowNonJsonMessages?: boolean;
}

/**
 * RPC handler options for @RabbitRPC decorator
 */
export interface RabbitRPCOptions extends RabbitSubscribeOptions {
  /** RPC timeout in milliseconds */
  timeout?: number;
}

/**
 * Message wrapper interface
 */
export interface RabbitMQMessage<T = unknown> {
  /** Message content */
  content: T;
  /** Message fields */
  fields: {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
  };
  /** Message properties */
  properties: {
    contentType?: string;
    contentEncoding?: string;
    headers?: Record<string, unknown>;
    deliveryMode?: number;
    priority?: number;
    correlationId?: string;
    replyTo?: string;
    expiration?: string;
    messageId?: string;
    timestamp?: number;
    type?: string;
    userId?: string;
    appId?: string;
    clusterId?: string;
  };
  /** Acknowledge message */
  ack: () => void;
  /** Negative acknowledge message */
  nack: (requeue?: boolean) => void;
  /** Reject message */
  reject: (requeue?: boolean) => void;
}

/**
 * Publisher options
 */
export interface RabbitMQPublishOptions {
  /** Message headers */
  headers?: Record<string, unknown>;
  /** Message priority (0-9) */
  priority?: number;
  /** Message expiration in milliseconds */
  expiration?: number;
  /** Correlation ID for RPC */
  correlationId?: string;
  /** Reply queue for RPC */
  replyTo?: string;
  /** Message type */
  type?: string;
  /** Persistent message (saved to disk) */
  persistent?: boolean;
  /** Message ID */
  messageId?: string;
}

/**
 * RPC Request options for AmqpConnection.request()
 */
export interface RequestOptions<T = unknown> {
  /** Exchange to publish to */
  exchange: string;
  /** Routing key */
  routingKey: string;
  /** Payload to send */
  payload: T;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Custom headers */
  headers?: Record<string, unknown>;
  /** Custom correlation ID (auto-generated if not provided) */
  correlationId?: string;
}

/**
 * Serializer function type for custom message serialization
 */
export type RabbitMQSerializer = (message: unknown) => Buffer;

/**
 * Deserializer function type for custom message deserialization
 */
export type RabbitMQDeserializer = (message: Buffer, msg: unknown) => unknown;
