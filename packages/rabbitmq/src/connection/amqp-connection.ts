import type { Channel, ChannelModel, ConsumeMessage, Replies } from "amqplib";
import { randomUUID } from "crypto";

import type { Logger } from "nestelia";
import type {
  RabbitMQConfig,
  RabbitMQExchangeConfig,
  RabbitMQMessage,
  RabbitMQPublishOptions,
  RabbitMQQueueConfig,
  RabbitRPCOptions,
  RabbitSubscribeOptions,
  RequestOptions,
} from "../interfaces/rabbitmq.interface";
import { RABBIT_RPC_METADATA, RABBIT_SUBSCRIBE_METADATA } from "../decorators/rabbitmq.decorators";
import { MessageSerializer } from "./message-serializer";

export const RABBITMQ_CONFIG = "RABBITMQ_CONFIG";
export const RABBITMQ_CONNECTION = "RABBITMQ_CONNECTION";

interface ActiveConsumer {
  consumerTag: string;
  queue: string;
}

interface PendingRpc {
  replyQueue: string;
  timeoutId: ReturnType<typeof setTimeout>;
  consumerTag: string;
}

const DEFAULT_PREFETCH_COUNT = 10;
const DEFAULT_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_INTERVAL = 5000;
const DEFAULT_RPC_TIMEOUT = 30000;

// Valid AMQP URL pattern
const AMQP_URL_PATTERN = /^amqps?:\/\/([^:@]+(:[^@]+)?@)?[^:/]+(:\d+)?(\/.*)?$/;

/**
 * RabbitMQ connection class for publishing and consuming messages
 * This is the main class for RabbitMQ operations
 */
export class AmqpConnection {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private publisherChannel: Channel | null = null;
  private config: RabbitMQConfig;
  private logger: Logger;
  private isConnected = false;
  private isInitializing = false;
  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private activeConsumers: Map<string, ActiveConsumer> = new Map();
  private pendingRpcs: Map<string, PendingRpc> = new Map();
  private serializer: MessageSerializer;
  // Track already asserted exchanges and queues to avoid duplicate assertions
  private assertedExchanges = new Set<string>();
  private assertedQueues = new Set<string>();
  // Unique connection ID for tracking
  private readonly connectionId: string;

  constructor(config: RabbitMQConfig, logger: Logger) {
    this.config = {
      prefetchCount: DEFAULT_PREFETCH_COUNT,
      reconnect: true,
      reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
      reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
      ...config,
    };
    this.serializer = new MessageSerializer(config.maxMessageSize);
    this.logger = logger;
    this.connectionId = randomUUID().slice(0, 8);
  }

  /**
   * Validate RabbitMQ connection URL
   */
  private validateUrl(url: string): void {
    if (!AMQP_URL_PATTERN.test(url)) {
      throw new Error(
        `Invalid RabbitMQ URL format. Expected: amqp(s)://[user:pass@]host[:port][/vhost]`,
      );
    }
  }

  /**
   * Sanitize and validate exchange name
   */
  private sanitizeExchangeName(name: string): string {
    return MessageSerializer.sanitizeExchangeName(name);
  }

  /**
   * Sanitize and validate queue name
   */
  private sanitizeQueueName(name: string): string {
    return MessageSerializer.sanitizeQueueName(name);
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    // Prevent concurrent initialization
    if (this.isInitializing) {
      this.logger.debug("Connection initialization already in progress, skipping...");
      return;
    }

    // Already connected - check if connection is still open
    if (this.isConnected && this.connection) {
      this.logger.debug("Already connected to RabbitMQ, skipping initialization");
      return;
    }

    this.isInitializing = true;

    try {
      // Clear any pending reconnection timeout
      if (this.reconnectTimeoutId) {
        clearTimeout(this.reconnectTimeoutId);
        this.reconnectTimeoutId = null;
      }

      // Dynamic import to avoid issues if amqplib is not installed
      const amqp = await import("amqplib");

      // Get connection URL: prefer uri, then fall back to urls[0]
      const url = this.config.uri || this.config.urls?.[0];
      if (!url) {
        throw new Error("RabbitMQ connection URL not provided. Set 'uri' or 'urls' in config.");
      }
      this.validateUrl(url);
      this.connection = await amqp.connect(url);

      if (!this.connection) {
        throw new Error("Failed to create RabbitMQ connection");
      }

      const conn = this.connection;

      conn.on("error", (err: Error) => {
        this.logger.error("RabbitMQ connection error:", err);
        this.isConnected = false;
      });

      conn.on("close", () => {
        this.logger.warn("RabbitMQ connection closed");
        this.isConnected = false;
        this.handleReconnect().catch((err: Error) => {
          this.logger.error("Error during reconnection:", err);
        });
      });

      // Create separate channels for publishing and consuming
      this.channel = await conn.createChannel();
      this.publisherChannel = await conn.createChannel();

      // Set prefetch count on consumer channel
      if (this.config.prefetchCount) {
        await this.channel.prefetch(this.config.prefetchCount);
      }

      this.channel.on("error", (err: Error) => {
        this.logger.error("RabbitMQ consumer channel error:", err);
      });

      this.channel.on("close", () => {
        this.logger.warn("RabbitMQ consumer channel closed");
      });

      this.publisherChannel.on("error", (err: Error) => {
        this.logger.error("RabbitMQ publisher channel error:", err);
      });

      this.publisherChannel.on("close", () => {
        this.logger.warn("RabbitMQ publisher channel closed");
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.isInitializing = false;

      // Assert configured exchanges
      if (this.config.exchanges?.length) {
        for (const exchange of this.config.exchanges) {
          await this.assertExchange(exchange);
        }
      }

      // Assert configured queues
      if (this.config.queues?.length) {
        for (const queue of this.config.queues) {
          await this.assertQueue(queue);
        }
      }

      this.logger.log(`Successfully connected to RabbitMQ broker (default)`);
      this.logger.log(`Successfully connected a RabbitMQ channel "AmqpConnection"`);
    } catch (error) {
      this.isInitializing = false;
      this.logger.error("Failed to connect to RabbitMQ:", error);
      this.handleReconnect().catch((err: Error) => {
        this.logger.error("Error during reconnection after failed connect:", err);
      });
      throw error;
    }
  }

  /**
   * Handle reconnection logic
   */
  private async handleReconnect(): Promise<void> {
    if (!this.config.reconnect) {
      return;
    }

    // Clear any existing reconnection timeout to prevent duplicates
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.reconnectAttempts >= (this.config.reconnectAttempts || DEFAULT_RECONNECT_ATTEMPTS)) {
      this.logger.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    this.logger.log(
      `Reconnecting to RabbitMQ (attempt ${this.reconnectAttempts}/${
        this.config.reconnectAttempts ?? DEFAULT_RECONNECT_ATTEMPTS
      })...`,
    );

    this.reconnectTimeoutId = setTimeout(() => {
      this.reconnectTimeoutId = null;
      this.connect().catch((err: Error) => {
        this.logger.error("Reconnection failed:", err);
      });
    }, this.config.reconnectInterval ?? DEFAULT_RECONNECT_INTERVAL);
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    // Clear reconnection timeout to prevent reconnection after disconnect
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    // Clear asserted exchanges and queues so they can be re-asserted on reconnect
    this.assertedExchanges.clear();
    this.assertedQueues.clear();

    // Cancel all active consumers
    for (const [id, consumer] of this.activeConsumers) {
      try {
        await this.channel?.cancel(consumer.consumerTag);
      } catch {
        // Ignore errors during cleanup
      }
      this.activeConsumers.delete(id);
    }

    // Cleanup pending RPCs
    for (const [correlationId, rpc] of this.pendingRpcs) {
      clearTimeout(rpc.timeoutId);
      try {
        await this.channel?.deleteQueue(rpc.replyQueue);
      } catch {
        // Ignore errors during cleanup
      }
      this.pendingRpcs.delete(correlationId);
    }

    try {
      if (this.publisherChannel) {
        await this.publisherChannel.close();
        this.publisherChannel = null;
      }
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.isConnected = false;
      this.isInitializing = false;
      this.logger.log("RabbitMQ disconnected");
    } catch (error) {
      this.logger.error("Error disconnecting from RabbitMQ:", error);
    }
  }

  /**
   * Check if connected to RabbitMQ
   */
  isConnectionReady(): boolean {
    return this.isConnected && this.channel !== null;
  }

  /**
   * Assert an exchange.
   * When createIfNotExists is false, uses checkExchange (passive declare).
   */
  async assertExchange(config: RabbitMQExchangeConfig): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    const exchangeName = this.getExchangeName(config.name);

    // Skip if already asserted to avoid redundant operations
    if (this.assertedExchanges.has(exchangeName)) {
      return;
    }

    const shouldCreate = config.createIfNotExists !== false;

    if (shouldCreate) {
      const type = config.type || this.config.defaultExchangeType || "topic";
      await this.channel.assertExchange(exchangeName, type, config.options);
    } else {
      await this.channel.checkExchange(exchangeName);
    }

    this.assertedExchanges.add(exchangeName);
    this.logger.debug(`Exchange '${exchangeName}' asserted`);
  }

  /**
   * Assert a queue
   */
  async assertQueue(config: RabbitMQQueueConfig): Promise<void> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    const queueName = this.getQueueName(config.name);

    // Skip if already asserted to avoid redundant operations
    if (this.assertedQueues.has(queueName)) {
      return;
    }

    await this.channel.assertQueue(queueName, config.options);

    // Bind queue to exchanges (from bindings array)
    if (config.bindings) {
      for (const binding of config.bindings) {
        const exchangeName = this.getExchangeName(binding.exchange);
        await this.channel.bindQueue(
          queueName,
          exchangeName,
          binding.routingKey,
          binding.arguments,
        );
      }
    }

    // Shortcut: bind to exchange directly (for simple cases)
    if (config.exchange && config.routingKey !== undefined) {
      const exchangeName = this.getExchangeName(config.exchange);
      await this.channel.bindQueue(queueName, exchangeName, config.routingKey);
    }

    this.assertedQueues.add(queueName);
    this.logger.debug(`Queue '${queueName}' asserted`);
  }

  /**
   * Publish a message to an exchange
   */
  async publish<T = unknown>(
    exchange: string,
    routingKey: string,
    message: T,
    options?: RabbitMQPublishOptions,
  ): Promise<boolean> {
    if (!this.publisherChannel) {
      throw new Error("RabbitMQ publisher channel not available");
    }

    const exchangeName = this.getExchangeName(exchange);
    const content = this.serializer.serialize(message);

    const published = this.publisherChannel.publish(exchangeName, routingKey, content, {
      persistent: options?.persistent ?? true,
      headers: options?.headers,
      priority: options?.priority,
      expiration: options?.expiration?.toString(),
      correlationId: options?.correlationId,
      replyTo: options?.replyTo,
      type: options?.type,
      messageId: options?.messageId,
    });

    if (published) {
      this.logger.debug(`Message published to '${exchangeName}:${routingKey}'`);
    }

    return published;
  }

  /**
   * Send a message directly to a queue
   */
  async sendToQueue<T = unknown>(
    queue: string,
    message: T,
    options?: RabbitMQPublishOptions,
  ): Promise<boolean> {
    if (!this.publisherChannel) {
      throw new Error("RabbitMQ publisher channel not available");
    }

    const queueName = this.getQueueName(queue);
    const content = this.serializer.serialize(message);

    const sent = this.publisherChannel.sendToQueue(queueName, content, {
      persistent: options?.persistent ?? true,
      headers: options?.headers,
      priority: options?.priority,
      expiration: options?.expiration?.toString(),
      correlationId: options?.correlationId,
      replyTo: options?.replyTo,
    });

    if (sent) {
      this.logger.debug(`Message sent to queue '${queueName}'`);
    }

    return sent;
  }

  /**
   * Subscribe to messages from a queue
   */
  async subscribe<T = unknown>(
    queue: string,
    handler: (message: RabbitMQMessage<T>) => Promise<void> | void,
    options?: { noAck?: boolean; consumerTag?: string },
  ): Promise<string> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    const queueName = this.getQueueName(queue);

    const { consumerTag } = await this.channel.consume(
      queueName,
      (msg: ConsumeMessage | null) => {
        if (!msg) {
          return;
        }

        const rabbitMessage = this.createRabbitMessage<T>(msg);

        Promise.resolve(handler(rabbitMessage)).catch((error: Error) => {
          this.logger.error("Error handling message:", error);
          rabbitMessage.nack(false);
        });
      },
      { noAck: options?.noAck ?? false, consumerTag: options?.consumerTag },
    );

    // Track the consumer for cleanup
    this.activeConsumers.set(consumerTag, { consumerTag, queue: queueName });

    this.logger.log(`Subscribed to queue '${queueName}' with consumer tag '${consumerTag}'`);

    return consumerTag;
  }

  /**
   * Cancel a consumer subscription
   */
  async unsubscribe(consumerTag: string): Promise<void> {
    if (!this.channel) {
      return;
    }

    try {
      await this.channel.cancel(consumerTag);
      this.activeConsumers.delete(consumerTag);
      this.logger.debug(`Cancelled consumer '${consumerTag}'`);
    } catch (error) {
      this.logger.error(`Failed to cancel consumer '${consumerTag}':`, error);
      throw error;
    }
  }

  /**
   * Create a RabbitMQ message wrapper
   */
  private createRabbitMessage<T>(msg: ConsumeMessage): RabbitMQMessage<T> {
    const parsedContent = this.serializer.parse<T>(msg.content);
    // If parseMessageContent returns a Buffer, cast it to unknown first
    // This handles non-JSON messages gracefully while maintaining type safety
    const content: T = Buffer.isBuffer(parsedContent)
      ? (parsedContent as unknown as T)
      : parsedContent;

    return {
      content,
      fields: {
        deliveryTag: msg.fields.deliveryTag,
        redelivered: msg.fields.redelivered,
        exchange: msg.fields.exchange,
        routingKey: msg.fields.routingKey,
      },
      properties: msg.properties,
      ack: () => this.channel?.ack(msg),
      nack: (requeue = false) => this.channel?.nack(msg, false, requeue),
      reject: (requeue = false) => this.channel?.reject(msg, requeue),
    };
  }

  /**
   * Get full exchange name with prefix
   */
  private getExchangeName(name: string): string {
    const sanitizedName = this.sanitizeExchangeName(name);
    return this.config.exchangePrefix
      ? `${this.config.exchangePrefix}.${sanitizedName}`
      : sanitizedName;
  }

  /**
   * Get full queue name with prefix
   */
  private getQueueName(name: string): string {
    const sanitizedName = this.sanitizeQueueName(name);
    return this.config.queuePrefix ? `${this.config.queuePrefix}.${sanitizedName}` : sanitizedName;
  }

  /**
   * Get the logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Get the consumer channel (for consuming messages)
   */
  getChannel(): Channel | null {
    return this.channel;
  }

  /**
   * Get the publisher channel (for publishing messages)
   */
  getPublisherChannel(): Channel | null {
    return this.publisherChannel;
  }

  /**
   * Get the underlying connection (for advanced usage)
   */
  getConnection(): ChannelModel | null {
    return this.connection;
  }

  /**
   * Make an RPC request and wait for a response
   * This method creates a temporary reply queue, sends the request, and waits for a response
   *
   * @param options Request options including exchange, routingKey, and payload
   * @returns Promise that resolves with the response
   *
   * @example
   * ```typescript
   * const response = await amqpConnection.request({
   *   exchange: 'rpc',
   *   routingKey: 'calculator.add',
   *   payload: { a: 1, b: 2 },
   *   timeout: 10000,
   * });
   * console.log(response); // { result: 3 }
   * ```
   */
  async request<T = unknown, R = unknown>(options: RequestOptions<T>): Promise<R> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    if (!this.isConnected) {
      throw new Error("RabbitMQ connection is not ready");
    }

    const {
      exchange,
      routingKey,
      payload,
      timeout = DEFAULT_RPC_TIMEOUT,
      headers,
      correlationId: customCorrelationId,
    } = options;

    // Create a unique correlation ID using crypto-secure random UUID
    const correlationId = customCorrelationId ?? randomUUID();

    // Create a temporary reply queue
    const { queue: replyQueue } = await this.channel.assertQueue("", {
      exclusive: true,
      autoDelete: true,
    });

    let consumerInfo: Replies.Consume | null = null;

    return new Promise<R>((resolve, reject) => {
      const cleanup = async (): Promise<void> => {
        // Remove from pending RPCs tracking
        this.pendingRpcs.delete(correlationId);

        if (consumerInfo) {
          try {
            await this.channel?.cancel(consumerInfo.consumerTag);
          } catch {
            // Ignore errors during cleanup
          }
        }

        // Delete the reply queue
        try {
          await this.channel?.deleteQueue(replyQueue);
        } catch {
          // Ignore errors during cleanup
        }
      };

      const timeoutId = setTimeout(() => {
        cleanup().catch((err: Error) => {
          this.logger.error("Error during RPC cleanup on timeout:", err);
        });
        reject(new Error(`RPC request timeout after ${timeout}ms`));
      }, timeout);

      // Track this RPC for cleanup on disconnect
      this.pendingRpcs.set(correlationId, {
        replyQueue,
        timeoutId,
        consumerTag: "",
      });

      // Consume from the reply queue
      this.channel!.consume(
        replyQueue,
        (msg: ConsumeMessage | null) => {
          if (!msg) {
            return;
          }

          // Check if this is the response to our request
          if (msg.properties.correlationId === correlationId) {
            clearTimeout(timeoutId);
            cleanup().catch((err: Error) => {
              this.logger.error("Error during RPC cleanup on response:", err);
            });

            const content = this.serializer.parse<R>(msg.content);
            // Handle both parsed JSON and raw Buffer
            if (Buffer.isBuffer(content)) {
              resolve(content as unknown as R);
            } else {
              resolve(content);
            }
          }
        },
        { noAck: true },
      )
        .then((consumer) => {
          consumerInfo = consumer;

          // Update tracking with consumer tag
          const rpc = this.pendingRpcs.get(correlationId);
          if (rpc) {
            rpc.consumerTag = consumer.consumerTag;
          }

          // Publish the request
          const content = this.serializer.serialize(payload);
          const published = this.channel!.publish(exchange, routingKey, content, {
            correlationId,
            replyTo: replyQueue,
            headers,
            persistent: false,
          });

          if (!published) {
            clearTimeout(timeoutId);
            cleanup().catch((err: Error) => {
              this.logger.error("Error during RPC cleanup on failed publish:", err);
            });
            reject(new Error("Failed to publish RPC request"));
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          cleanup().catch((err: Error) => {
            this.logger.error("Error during RPC cleanup on error:", err);
          });
          reject(error);
        });
    });
  }

  /**
   * Register RabbitMQ handlers from a service instance
   * Scans the instance's class for @RabbitSubscribe and @RabbitRPC decorators
   * and sets up consumers that invoke the actual methods
   *
   * @param instance The handler instance with @RabbitSubscribe/@RabbitRPC methods
   *
   * @example
   * ```typescript
   * await amqpConnection.registerHandlers(ordersHandlerInstance);
   * ```
   */
  async registerHandlers(instance: object): Promise<void> {
    const constructor = instance.constructor as new (...args: unknown[]) => object;
    const handlerName = constructor.name;

    // Get subscribe handlers metadata
    const subscribeHandlers =
      (Reflect.getMetadata(RABBIT_SUBSCRIBE_METADATA, constructor) as Array<{
        methodName: string | symbol;
        options: RabbitSubscribeOptions;
      }>) || [];

    // Get RPC handlers metadata
    const rpcHandlers =
      (Reflect.getMetadata(RABBIT_RPC_METADATA, constructor) as Array<{
        methodName: string | symbol;
        options: RabbitRPCOptions;
      }>) || [];

    const totalHandlers = subscribeHandlers.length + rpcHandlers.length;

    if (totalHandlers === 0) {
      return;
    }

    this.logger.log(`Registering rabbitmq handlers from ${handlerName}`);

    // Register subscribe handlers
    for (const { methodName, options: subscribeOptions } of subscribeHandlers) {
      await this.setupSubscribeHandler(instance, handlerName, methodName, subscribeOptions);
    }

    // Register RPC handlers
    for (const { methodName, options: rpcOptions } of rpcHandlers) {
      await this.setupRpcHandler(instance, handlerName, methodName, rpcOptions);
    }
  }

  /**
   * Set up a single @RabbitSubscribe handler:
   * assert & bind queue, start consuming.
   * Exchanges must be pre-configured via RabbitMQModule.forRoot({ exchanges }).
   */
  private async setupSubscribeHandler(
    instance: object,
    handlerName: string,
    methodName: string | symbol,
    options: RabbitSubscribeOptions,
  ): Promise<void> {
    const exchange = options.exchange;
    const routingKeys = Array.isArray(options.routingKey)
      ? options.routingKey
      : [options.routingKey];
    const queue = options.queue || "";

    this.logger.log(
      `${handlerName}.${String(methodName)} {subscribe} -> ${exchange}::${routingKeys.join(",")}::${queue}`,
    );

    // Ensure the exchange exists before binding queues to it
    if (exchange) {
      await this.assertExchange({
        name: exchange,
        type: options.exchangeType,
        options: options.exchangeOptions,
      });
    }

    // Assert and bind queue
    if (queue) {
      await this.assertQueue({
        name: queue,
        options: options.queueOptions,
        bindings: routingKeys.map((rk) => ({ exchange, routingKey: rk })),
      });

      // Subscribe with a callback that invokes the actual method
      await this.subscribe(queue, async (message) => {
        try {
          const method = (instance as Record<string | symbol, Function>)[methodName];
          await method.call(instance, message.content);
          message.ack();
        } catch (error) {
          this.logger.error(
            `Error in ${handlerName}.${String(methodName)}:`,
            error,
          );
          message.nack(false);
        }
      });
    }
  }

  /**
   * Set up a single @RabbitRPC handler:
   * assert & bind queue, consume and reply.
   * Exchanges must be pre-configured via RabbitMQModule.forRoot({ exchanges }).
   */
  private async setupRpcHandler(
    instance: object,
    handlerName: string,
    methodName: string | symbol,
    options: RabbitRPCOptions,
  ): Promise<void> {
    const exchange = options.exchange;
    const routingKeys = Array.isArray(options.routingKey)
      ? options.routingKey
      : [options.routingKey];
    const queue = options.queue || "";

    this.logger.log(
      `${handlerName}.${String(methodName)} {rpc} -> ${exchange}::${routingKeys.join(",")}::${queue}`,
    );

    // Ensure the exchange exists before binding queues to it
    if (exchange) {
      await this.assertExchange({
        name: exchange,
        type: options.exchangeType,
        options: options.exchangeOptions,
      });
    }

    // Assert and bind queue
    if (queue) {
      await this.assertQueue({
        name: queue,
        options: options.queueOptions,
        bindings: routingKeys.map((rk) => ({ exchange, routingKey: rk })),
      });

      // Subscribe with a callback that invokes the method and sends a reply
      await this.subscribe(queue, async (message) => {
        try {
          const method = (instance as Record<string | symbol, Function>)[methodName];
          const result = await method.call(instance, message.content);

          // Send RPC reply if replyTo is set
          if (message.properties.replyTo && message.properties.correlationId) {
            const content = this.serializer.serialize(result);
            this.publisherChannel?.sendToQueue(
              message.properties.replyTo,
              content,
              {
                correlationId: message.properties.correlationId,
                persistent: false,
              },
            );
          }

          message.ack();
        } catch (error) {
          this.logger.error(
            `Error in ${handlerName}.${String(methodName)}:`,
            error,
          );
          message.nack(false);
        }
      });
    }
  }
}

/**
 * Alias for AmqpConnection for backward compatibility
 * @deprecated Use AmqpConnection instead
 */
export const RabbitMQService = AmqpConnection;
