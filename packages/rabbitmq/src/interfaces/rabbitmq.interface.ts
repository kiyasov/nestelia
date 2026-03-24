import type { Channel, ConsumeMessage } from "amqplib";

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
export type MessageHandlerErrorBehavior = "ACK" | "NACK" | "REQUEUE";

/**
 * Error handler for a single message
 */
export type MessageErrorHandler = (
  channel: Channel,
  msg: ConsumeMessage,
  error: unknown,
) => Promise<void> | void;

/**
 * Error handler for batch messages
 */
export type BatchMessageErrorHandler = (
  channel: Channel,
  msgs: ConsumeMessage[],
  error: unknown,
) => Promise<void> | void;

/**
 * Error handler for queue assertion failures
 */
export type AssertQueueErrorHandler = (
  channel: Channel,
  queueName: string,
  queueOptions: unknown,
  error: unknown,
) => Promise<string> | string;

/**
 * Channel configuration
 */
export interface RabbitMQChannelConfig {
  /** Prefetch count for this channel */
  prefetchCount?: number;
  /** Whether this is the default channel */
  default?: boolean;
}

/**
 * Exchange-to-exchange binding configuration
 */
export interface RabbitMQExchangeBindingConfig {
  /** Destination exchange name */
  destination: string;
  /** Source exchange name */
  source: string;
  /** Routing pattern */
  pattern: string;
  /** Binding arguments */
  args?: Record<string, unknown>;
}

/**
 * Batch subscribe options
 */
export interface BatchOptions {
  /** Number of messages to accumulate before calling handler */
  size: number;
  /** Timeout in ms to flush partial batch (default: 200) */
  timeout?: number;
  /** Error handler for batch failures */
  errorHandler?: BatchMessageErrorHandler;
}

/**
 * Queue options with consumer configuration
 */
export interface QueueOptions {
  durable?: boolean;
  exclusive?: boolean;
  autoDelete?: boolean;
  arguments?: Record<string, unknown>;
  /** Message TTL in milliseconds */
  messageTtl?: number;
  /** Queue expiry in milliseconds */
  expires?: number;
  /** Dead letter exchange */
  deadLetterExchange?: string;
  /** Dead letter routing key */
  deadLetterRoutingKey?: string;
  /** Maximum number of messages in queue */
  maxLength?: number;
  /** Maximum queue size in bytes */
  maxLengthBytes?: number;
  /** Maximum priority (0-255) */
  maxPriority?: number;
  /** Arguments for bindQueue */
  bindQueueArguments?: Record<string, unknown>;
  /** Route to specific named channel */
  channel?: string;
  /** Consumer options */
  consumerOptions?: {
    consumerTag?: string;
    noAck?: boolean;
    exclusive?: boolean;
    priority?: number;
    arguments?: Record<string, unknown>;
  };
}

/**
 * Module-level handler configuration for merging with decorator options
 */
export interface MessageHandlerOptions {
  exchange?: string;
  routingKey?: string | string[];
  queue?: string;
  queueOptions?: QueueOptions;
  errorHandler?: MessageErrorHandler;
  errorBehavior?: MessageHandlerErrorBehavior;
  allowNonJsonMessages?: boolean;
  createQueueIfNotExists?: boolean;
  assertQueueErrorHandler?: AssertQueueErrorHandler;
  deserializer?: (message: Buffer, msg?: unknown) => unknown;
  usePersistentReplyTo?: boolean;
  /** Lookup key for handler config merging */
  name?: string;
  /** Batch options */
  batch?: BatchOptions;
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
  /** Prefetch count (number of messages processed concurrently, default: 10) */
  prefetchCount?: number;
  /** Enable automatic reconnection */
  reconnect?: boolean;
  /** Reconnection attempts */
  reconnectAttempts?: number;
  /** Reconnection interval in milliseconds */
  reconnectInterval?: number;
  /** Exchanges to assert on connection */
  exchanges?: RabbitMQExchangeConfig[];
  /** Exchange-to-exchange bindings */
  exchangeBindings?: RabbitMQExchangeBindingConfig[];
  /** Queues to assert on connection */
  queues?: RabbitMQQueueConfig[];
  /** Channel configurations */
  channels?: Record<string, RabbitMQChannelConfig>;
  /** Default error behavior for RPC handlers */
  defaultRpcErrorBehavior?: MessageHandlerErrorBehavior;
  /** Default error handler for RPC handlers */
  defaultRpcErrorHandler?: MessageErrorHandler;
  /** Default error behavior for subscribe handlers */
  defaultSubscribeErrorBehavior?: MessageHandlerErrorBehavior;
  /** Default RPC timeout in milliseconds (default: 10000) */
  defaultRpcTimeout?: number;
  /** Connection initialization options */
  connectionInitOptions?: ConnectionInitOptions;
  /** Register handlers automatically */
  registerHandlers?: boolean;
  /** Enable controller discovery */
  enableControllerDiscovery?: boolean;
  /** Default exchange type for exchanges without an explicit type (default: "topic") */
  defaultExchangeType?: RabbitMQExchangeType;
  /** Maximum message size in bytes (default: 10MB) */
  maxMessageSize?: number;
  /** Enable Direct Reply-To queue for RPC (default: true) */
  enableDirectReplyTo?: boolean;
  /** Default publish options merged into every publish call */
  defaultPublishOptions?: Record<string, unknown>;
  /** Custom message serializer */
  serializer?: (value: unknown) => Buffer;
  /** Custom message deserializer */
  deserializer?: (message: Buffer, msg?: unknown) => unknown;
  /** Module-level handler configs for merging with decorator options */
  handlers?: Record<string, MessageHandlerOptions | MessageHandlerOptions[]>;
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
  /** Exchange type (defaults to config.defaultExchangeType or "topic") */
  type?: RabbitMQExchangeType;
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
  /**
   * Create exchange if it doesn't exist (default: true).
   * When false, uses checkExchange instead of assertExchange.
   */
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
  /** Exchange name (must be pre-configured in RabbitMQModule.forRoot({ exchanges })) */
  exchange: string;
  /** Routing key pattern */
  routingKey: string | string[];
  /** Queue name (auto-generated if not provided) */
  queue?: string;
  /** Queue options */
  queueOptions?: QueueOptions;
  /** Per-handler error handler */
  errorHandler?: MessageErrorHandler;
  /** Per-handler error behavior */
  errorBehavior?: MessageHandlerErrorBehavior;
  /** Whether to allow non-JSON messages */
  allowNonJsonMessages?: boolean;
  /** Create queue if it doesn't exist (default: true) */
  createQueueIfNotExists?: boolean;
  /** Custom assertion error handler */
  assertQueueErrorHandler?: AssertQueueErrorHandler;
  /** Custom deserializer for this handler */
  deserializer?: (message: Buffer, msg?: unknown) => unknown;
  /** Lookup key for merging with module-level handler config */
  name?: string;
  /** Batch subscribe options */
  batch?: BatchOptions;
}

/**
 * RPC handler options for @RabbitRPC decorator
 */
export interface RabbitRPCOptions extends RabbitSubscribeOptions {
  /** RPC timeout in milliseconds */
  timeout?: number;
  /** Whether to use persistent messages for RPC replies (default: false) */
  usePersistentReplyTo?: boolean;
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
