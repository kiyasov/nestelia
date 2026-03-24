import type { Channel, ChannelModel, ConsumeMessage, Replies } from "amqplib";
import { randomUUID } from "crypto";

import type { Logger } from "nestelia";
import { Nack } from "../nack";
import type {
  RabbitMQConfig,
  RabbitMQExchangeConfig,
  RabbitMQMessage,
  RabbitMQPublishOptions,
  RabbitMQQueueConfig,
  RabbitRPCOptions,
  RabbitSubscribeOptions,
  RequestOptions,
  MessageErrorHandler,
  MessageHandlerErrorBehavior,
  BatchOptions,
} from "../interfaces/rabbitmq.interface";
import {
  RABBIT_RPC_METADATA,
  RABBIT_SUBSCRIBE_METADATA,
  RABBIT_PAYLOAD_METADATA,
  RABBIT_HEADER_METADATA,
  RABBIT_REQUEST_METADATA,
} from "../decorators/rabbitmq.decorators";
import { MessageSerializer } from "./message-serializer";

export const RABBITMQ_CONFIG = "RABBITMQ_CONFIG";
export const RABBITMQ_CONNECTION = "RABBITMQ_CONNECTION";

const DIRECT_REPLY_QUEUE = "amq.rabbitmq.reply-to";

interface ConsumerHandler {
  type: "subscribe" | "rpc" | "batch";
  consumerTag: string;
  handler: Function;
  msgOptions: RabbitSubscribeOptions | RabbitRPCOptions;
  instance: object;
  methodName: string | symbol;
  handlerName: string;
}

interface RpcHandlerEntry {
  routingKey: string | string[];
  handler: Function;
  rpcOptions: RabbitRPCOptions;
  instance: object;
  methodName: string | symbol;
  handlerName: string;
}

interface BatchState<T = unknown> {
  messages: ConsumeMessage[];
  timer: ReturnType<typeof setTimeout> | null;
  options: BatchOptions;
  handler: Function;
  instance: object;
  methodName: string | symbol;
  handlerName: string;
  subscribeOptions: RabbitSubscribeOptions;
}

const DEFAULT_PREFETCH_COUNT = 10;
const DEFAULT_RECONNECT_ATTEMPTS = 5;
const DEFAULT_RECONNECT_INTERVAL = 5000;
const DEFAULT_RPC_TIMEOUT = 10000;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_BATCH_TIMEOUT = 200;

// Valid AMQP URL pattern
const AMQP_URL_PATTERN = /^amqps?:\/\/([^:@]+(:[^@]+)?@)?[^:/]+(:\d+)?(\/.*)?$/;

/**
 * RabbitMQ connection class for publishing and consuming messages.
 * Aligned with golevelup/nestjs architecture:
 * - Exchanges asserted only during connect() from forRoot() config
 * - Subscribers only assert queues and bind them to existing exchanges
 * - Graceful shutdown with outstanding message tracking
 * - Configurable error behaviors per handler
 * - Direct Reply-To for RPC
 * - Multiple RPC handlers per queue with routing key matching
 * - Batch subscribe support
 * - Consumer cancel/resume
 */
export class AmqpConnection {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private publisherChannel: Channel | null = null;
  /**
   * Dedicated channel for exchange/queue assertions.
   * Kept separate from the consumer channel so that a 406/404 AMQP error
   * (e.g. type or durable mismatch) only kills this channel and never
   * disrupts active consumers.
   */
  private assertionChannel: Channel | null = null;
  private config: RabbitMQConfig;
  private logger: Logger;
  private isConnected = false;
  private isInitializing = false;
  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private serializer: MessageSerializer;

  // Track already asserted exchanges and queues to avoid duplicate assertions
  private assertedExchanges = new Set<string>();
  private assertedQueues = new Set<string>();

  // Consumer registry for cancel/resume
  private _consumers = new Map<string, ConsumerHandler>();

  // RPC handler multiplexing: multiple handlers per queue
  private _rpcHandlersByQueue = new Map<string, RpcHandlerEntry[]>();
  private _rpcConsumerTagByQueue = new Map<string, string>();

  // Batch state per queue
  private _batchStates = new Map<string, BatchState>();

  // Graceful shutdown: track outstanding message processing
  private outstandingMessageProcessing = new Set<Promise<void>>();

  // Direct Reply-To: RPC response subject
  private _rpcResponseHandlers = new Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timeoutId: ReturnType<typeof setTimeout>;
  }>();
  private _directReplyConsumerTag: string | null = null;

  constructor(config: RabbitMQConfig, logger: Logger) {
    this.config = {
      prefetchCount: DEFAULT_PREFETCH_COUNT,
      reconnect: true,
      reconnectAttempts: DEFAULT_RECONNECT_ATTEMPTS,
      reconnectInterval: DEFAULT_RECONNECT_INTERVAL,
      defaultRpcTimeout: DEFAULT_RPC_TIMEOUT,
      enableDirectReplyTo: true,
      ...config,
    };
    this.serializer = new MessageSerializer(config.maxMessageSize);
    this.logger = logger;
  }

  // ── Connection lifecycle ──────────────────────────────────────────

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

      // Create separate channels for publishing, consuming, and asserting
      this.channel = await conn.createChannel();
      this.publisherChannel = await conn.createChannel();
      this.assertionChannel = await conn.createChannel();

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

      this.assertionChannel.on("error", (err: Error) => {
        this.logger.error("RabbitMQ assertion channel error:", err);
        this.assertionChannel = null;
      });

      this.assertionChannel.on("close", () => {
        this.assertionChannel = null;
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.isInitializing = false;

      // Assert configured exchanges
      if (this.config.exchanges?.length) {
        for (const exchange of this.config.exchanges) {
          try {
            await this.assertExchange(exchange);
          } catch (err) {
            this.logger.error(
              `Failed to assert exchange '${exchange.name}': ${(err as Error).message}. ` +
              `Check that the exchange type and options match what is already declared on the broker.`,
            );
          }
        }
      }

      // Assert exchange bindings (exchange-to-exchange)
      if (this.config.exchangeBindings?.length) {
        const ch = await this.getOrCreateAssertionChannel();
        for (const binding of this.config.exchangeBindings) {
          try {
            await ch.bindExchange(
              this.getExchangeName(binding.destination),
              this.getExchangeName(binding.source),
              binding.pattern,
              binding.args,
            );
          } catch (err) {
            this.logger.error(
              `Failed to bind exchange '${binding.source}' -> '${binding.destination}': ${(err as Error).message}`,
            );
          }
        }
      }

      // Assert configured queues
      if (this.config.queues?.length) {
        for (const queue of this.config.queues) {
          try {
            await this.assertQueue(queue);
          } catch (err) {
            this.logger.error(
              `Failed to assert queue '${queue.name}': ${(err as Error).message}.`,
            );
          }
        }
      }

      // Set up Direct Reply-To queue for RPC
      if (this.config.enableDirectReplyTo !== false) {
        await this.initDirectReplyQueue();
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
   * Disconnect from RabbitMQ with graceful shutdown.
   * Waits for all outstanding message processing to complete.
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
    for (const [tag] of this._consumers) {
      try {
        await this.channel?.cancel(tag);
      } catch {
        // Ignore errors during cleanup
      }
    }
    this._consumers.clear();

    // Cancel Direct Reply-To consumer
    if (this._directReplyConsumerTag) {
      try {
        await this.channel?.cancel(this._directReplyConsumerTag);
      } catch {
        // Ignore errors during cleanup
      }
      this._directReplyConsumerTag = null;
    }

    // Clean up pending RPCs
    for (const [, pending] of this._rpcResponseHandlers) {
      clearTimeout(pending.timeoutId);
      pending.reject(new Error("Connection closing"));
    }
    this._rpcResponseHandlers.clear();

    // Clear batch timers
    for (const [, state] of this._batchStates) {
      if (state.timer) clearTimeout(state.timer);
    }
    this._batchStates.clear();

    // Wait for outstanding message processing to complete
    if (this.outstandingMessageProcessing.size > 0) {
      this.logger.log(
        `Waiting for ${this.outstandingMessageProcessing.size} outstanding message(s) to complete...`,
      );
      await Promise.allSettled([...this.outstandingMessageProcessing]);
    }

    try {
      if (this.assertionChannel) {
        await this.assertionChannel.close();
        this.assertionChannel = null;
      }
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

  // ── Exchange/queue assertion ──────────────────────────────────────

  /**
   * Assert an exchange.
   * Uses the dedicated assertion channel so broker errors never kill consumers.
   */
  async assertExchange(config: RabbitMQExchangeConfig): Promise<void> {
    const exchangeName = this.getExchangeName(config.name);

    if (this.assertedExchanges.has(exchangeName)) {
      return;
    }

    const ch = await this.getOrCreateAssertionChannel();
    const shouldCreate = config.createIfNotExists !== false;

    if (shouldCreate) {
      const type = config.type || this.config.defaultExchangeType || "topic";
      await ch.assertExchange(exchangeName, type, config.options);
    } else {
      await ch.checkExchange(exchangeName);
    }

    this.assertedExchanges.add(exchangeName);
    this.logger.debug(`Exchange '${exchangeName}' asserted`);
  }

  /**
   * Assert a queue and bind it to exchanges.
   * Uses the dedicated assertion channel so broker errors never kill consumers.
   */
  async assertQueue(config: RabbitMQQueueConfig): Promise<string> {
    const queueName = this.getQueueName(config.name);

    if (this.assertedQueues.has(queueName)) {
      return queueName;
    }

    const ch = await this.getOrCreateAssertionChannel();

    const { queue: actualQueue } = await ch.assertQueue(queueName, config.options);

    // Bind queue to exchanges (from bindings array)
    if (config.bindings) {
      for (const binding of config.bindings) {
        const exchangeName = this.getExchangeName(binding.exchange);
        await ch.bindQueue(
          actualQueue,
          exchangeName,
          binding.routingKey,
          binding.arguments,
        );
      }
    }

    // Shortcut: bind to exchange directly (for simple cases)
    if (config.exchange && config.routingKey !== undefined) {
      const exchangeName = this.getExchangeName(config.exchange);
      await ch.bindQueue(actualQueue, exchangeName, config.routingKey);
    }

    this.assertedQueues.add(actualQueue);
    this.logger.debug(`Queue '${actualQueue}' asserted`);

    return actualQueue;
  }

  // ── Publishing ────────────────────────────────────────────────────

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
    const content = this.serializeMessage(message);

    const publishOptions = {
      ...this.config.defaultPublishOptions,
      persistent: options?.persistent ?? true,
      headers: options?.headers,
      priority: options?.priority,
      expiration: options?.expiration?.toString(),
      correlationId: options?.correlationId,
      replyTo: options?.replyTo,
      type: options?.type,
      messageId: options?.messageId,
    };

    const published = this.publisherChannel.publish(
      exchangeName,
      routingKey,
      content,
      publishOptions,
    );

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
    const content = this.serializeMessage(message);

    const sent = this.publisherChannel.sendToQueue(queueName, content, {
      ...this.config.defaultPublishOptions,
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

  // ── Subscription ──────────────────────────────────────────────────

  /**
   * Subscribe to messages from a queue (low-level).
   * Consumer is wrapped for graceful shutdown tracking.
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
      this.wrapConsumer((msg: ConsumeMessage | null) => {
        if (!msg) return;
        const rabbitMessage = this.createRabbitMessage<T>(msg);
        return Promise.resolve(handler(rabbitMessage)).catch((error: Error) => {
          this.logger.error("Error handling message:", error);
          rabbitMessage.nack(false);
        });
      }),
      { noAck: options?.noAck ?? false, consumerTag: options?.consumerTag },
    );

    this.logger.log(`Subscribed to queue '${queueName}' with consumer tag '${consumerTag}'`);

    return consumerTag;
  }

  /**
   * Cancel a consumer subscription
   */
  async unsubscribe(consumerTag: string): Promise<void> {
    if (!this.channel) return;

    try {
      await this.channel.cancel(consumerTag);
      this._consumers.delete(consumerTag);
      this.logger.debug(`Cancelled consumer '${consumerTag}'`);
    } catch (error) {
      this.logger.error(`Failed to cancel consumer '${consumerTag}':`, error);
      throw error;
    }
  }

  /**
   * Cancel a registered consumer by tag. The handler info is preserved for resume.
   */
  async cancelConsumer(consumerTag: string): Promise<void> {
    if (!this.channel) return;

    const consumer = this._consumers.get(consumerTag);
    if (!consumer) {
      this.logger.warn(`No registered consumer found for tag '${consumerTag}'`);
      return;
    }

    try {
      await this.channel.cancel(consumerTag);
      this.logger.log(`Consumer '${consumerTag}' cancelled (can be resumed)`);
    } catch (error) {
      this.logger.error(`Failed to cancel consumer '${consumerTag}':`, error);
      throw error;
    }
  }

  /**
   * Resume a previously cancelled consumer. Creates a new consumer with the same handler.
   */
  async resumeConsumer(consumerTag: string): Promise<string> {
    const consumer = this._consumers.get(consumerTag);
    if (!consumer) {
      throw new Error(`No registered consumer found for tag '${consumerTag}'`);
    }

    // Remove old entry
    this._consumers.delete(consumerTag);

    // Re-register the handler
    if (consumer.type === "subscribe") {
      await this.setupSubscribeHandler(
        consumer.instance,
        consumer.handlerName,
        consumer.methodName,
        consumer.msgOptions as RabbitSubscribeOptions,
      );
    } else if (consumer.type === "rpc") {
      await this.setupRpcHandler(
        consumer.instance,
        consumer.handlerName,
        consumer.methodName,
        consumer.msgOptions as RabbitRPCOptions,
      );
    }

    // Find the new consumer tag
    const newTag = [...this._consumers.keys()].pop();
    this.logger.log(`Consumer '${consumerTag}' resumed as '${newTag}'`);

    return newTag || consumerTag;
  }

  // ── RPC Request (Direct Reply-To) ─────────────────────────────────

  /**
   * Make an RPC request using Direct Reply-To queue.
   */
  async request<T = unknown, R = unknown>(options: RequestOptions<T>): Promise<R> {
    if (!this.channel || !this.publisherChannel) {
      throw new Error("RabbitMQ channel not available");
    }

    if (!this.isConnected) {
      throw new Error("RabbitMQ connection is not ready");
    }

    const {
      exchange,
      routingKey,
      payload,
      timeout = this.config.defaultRpcTimeout || DEFAULT_RPC_TIMEOUT,
      headers,
      correlationId: customCorrelationId,
    } = options;

    const correlationId = customCorrelationId ?? randomUUID();

    // If Direct Reply-To is enabled, use it
    if (this.config.enableDirectReplyTo !== false && this._directReplyConsumerTag) {
      return this.requestViaDirectReplyTo<T, R>(
        exchange,
        routingKey,
        payload,
        correlationId,
        timeout,
        headers,
      );
    }

    // Fallback: create a temporary reply queue
    return this.requestViaTemporaryQueue<T, R>(
      exchange,
      routingKey,
      payload,
      correlationId,
      timeout,
      headers,
    );
  }

  // ── Handler registration ──────────────────────────────────────────

  /**
   * Register RabbitMQ handlers from a service instance.
   * Scans the instance's class for @RabbitSubscribe and @RabbitRPC decorators.
   */
  async registerHandlers(instance: object): Promise<void> {
    const constructor = instance.constructor as new (...args: unknown[]) => object;
    const handlerName = constructor.name;

    const subscribeHandlers =
      (Reflect.getMetadata(RABBIT_SUBSCRIBE_METADATA, constructor) as Array<{
        methodName: string | symbol;
        options: RabbitSubscribeOptions;
      }>) || [];

    const rpcHandlers =
      (Reflect.getMetadata(RABBIT_RPC_METADATA, constructor) as Array<{
        methodName: string | symbol;
        options: RabbitRPCOptions;
      }>) || [];

    const totalHandlers = subscribeHandlers.length + rpcHandlers.length;
    if (totalHandlers === 0) return;

    this.logger.log(`Registering rabbitmq handlers from ${handlerName}`);

    for (const { methodName, options: subOpts } of subscribeHandlers) {
      // Merge with module-level handler configs if name is provided
      const mergedOptions = this.mergeHandlerConfig(subOpts);

      if (mergedOptions.batch) {
        await this.setupBatchSubscribeHandler(
          instance,
          handlerName,
          methodName,
          mergedOptions,
        );
      } else {
        await this.setupSubscribeHandler(instance, handlerName, methodName, mergedOptions);
      }
    }

    for (const { methodName, options: rpcOpts } of rpcHandlers) {
      const mergedOptions = this.mergeHandlerConfig(rpcOpts) as RabbitRPCOptions;
      await this.setupRpcHandler(instance, handlerName, methodName, mergedOptions);
    }
  }

  // ── Accessors ─────────────────────────────────────────────────────

  getLogger(): Logger {
    return this.logger;
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  getPublisherChannel(): Channel | null {
    return this.publisherChannel;
  }

  getConnection(): ChannelModel | null {
    return this.connection;
  }

  /** Get all registered consumer tags */
  get consumerTags(): string[] {
    return [...this._consumers.keys()];
  }

  /** Get a registered consumer by tag */
  getConsumer(consumerTag: string): ConsumerHandler | undefined {
    return this._consumers.get(consumerTag);
  }

  // ── Private: connection helpers ───────────────────────────────────

  private validateUrl(url: string): void {
    if (!AMQP_URL_PATTERN.test(url)) {
      throw new Error(
        `Invalid RabbitMQ URL format. Expected: amqp(s)://[user:pass@]host[:port][/vhost]`,
      );
    }
  }

  private sanitizeExchangeName(name: string): string {
    return MessageSerializer.sanitizeExchangeName(name);
  }

  private sanitizeQueueName(name: string): string {
    return MessageSerializer.sanitizeQueueName(name);
  }

  private async handleReconnect(): Promise<void> {
    if (!this.config.reconnect) return;

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

  private async getOrCreateAssertionChannel(): Promise<Channel> {
    if (this.assertionChannel) {
      return this.assertionChannel;
    }

    if (!this.connection) {
      throw new Error("RabbitMQ connection not available");
    }

    this.assertionChannel = await this.connection.createChannel();

    this.assertionChannel.on("error", (err: Error) => {
      this.logger.error("RabbitMQ assertion channel error:", err);
      this.assertionChannel = null;
    });

    this.assertionChannel.on("close", () => {
      this.assertionChannel = null;
    });

    return this.assertionChannel;
  }

  private getExchangeName(name: string): string {
    if (!name) return name; // allow empty exchange (default exchange)
    const sanitizedName = this.sanitizeExchangeName(name);
    return this.config.exchangePrefix
      ? `${this.config.exchangePrefix}.${sanitizedName}`
      : sanitizedName;
  }

  private getQueueName(name: string): string {
    if (!name) return name; // allow empty queue (server-generated)
    const sanitizedName = this.sanitizeQueueName(name);
    return this.config.queuePrefix ? `${this.config.queuePrefix}.${sanitizedName}` : sanitizedName;
  }

  // ── Private: message helpers ──────────────────────────────────────

  /**
   * Wrap a consumer callback to track outstanding message processing
   * for graceful shutdown.
   */
  private wrapConsumer(
    consumer: (msg: ConsumeMessage | null) => void | Promise<void>,
  ): (msg: ConsumeMessage | null) => void {
    return (msg: ConsumeMessage | null) => {
      const promise = Promise.resolve(consumer(msg)).then(() => {});
      this.outstandingMessageProcessing.add(promise);
      promise.finally(() => {
        this.outstandingMessageProcessing.delete(promise);
      });
    };
  }

  /**
   * Deserialize a message using the per-handler or global deserializer.
   */
  private deserializeMessage<T>(
    msg: ConsumeMessage,
    options?: { deserializer?: (message: Buffer, msg?: unknown) => unknown; allowNonJsonMessages?: boolean },
  ): { message: T | undefined; headers: Record<string, unknown> } {
    const headers = (msg.properties.headers || {}) as Record<string, unknown>;

    if (msg.content.length === 0) {
      return { message: undefined, headers };
    }

    // Use per-handler deserializer, then global, then default
    const deserializer = options?.deserializer || this.config.deserializer;

    if (deserializer) {
      const message = deserializer(msg.content, msg) as T;
      return { message, headers };
    }

    // Default: use MessageSerializer
    try {
      const parsed = this.serializer.parse<T>(msg.content);
      if (Buffer.isBuffer(parsed)) {
        // Non-JSON content
        if (options?.allowNonJsonMessages) {
          return { message: parsed.toString() as unknown as T, headers };
        }
        return { message: parsed as unknown as T, headers };
      }
      return { message: parsed, headers };
    } catch {
      if (options?.allowNonJsonMessages) {
        return { message: msg.content.toString() as unknown as T, headers };
      }
      throw new Error("Failed to deserialize message");
    }
  }

  /**
   * Serialize a message using the global serializer or default.
   */
  private serializeMessage<T>(message: T): Buffer {
    if (Buffer.isBuffer(message) || message instanceof Uint8Array) {
      return Buffer.from(message);
    }
    if (this.config.serializer) {
      return this.config.serializer(message);
    }
    return this.serializer.serialize(message);
  }

  private createRabbitMessage<T>(msg: ConsumeMessage): RabbitMQMessage<T> {
    const parsedContent = this.serializer.parse<T>(msg.content);
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

  // ── Private: error handling ───────────────────────────────────────

  /**
   * Get the error handler for a message based on options.
   */
  private getErrorHandler(
    options: RabbitSubscribeOptions | RabbitRPCOptions,
    isRpc = false,
  ): MessageErrorHandler {
    // Per-handler error handler
    if (options.errorHandler) {
      return options.errorHandler as unknown as MessageErrorHandler;
    }

    // Per-handler error behavior (mapped to handler)
    if (options.errorBehavior) {
      return this.getHandlerForBehavior(options.errorBehavior);
    }

    // Global RPC error handler
    if (isRpc && this.config.defaultRpcErrorHandler) {
      return this.config.defaultRpcErrorHandler;
    }

    // Global subscribe error behavior
    if (this.config.defaultSubscribeErrorBehavior) {
      return this.getHandlerForBehavior(this.config.defaultSubscribeErrorBehavior);
    }

    // Default: NACK without requeue
    return (_channel: unknown, msg: ConsumeMessage) => {
      this.channel?.nack(msg, false, false);
    };
  }

  private getHandlerForBehavior(behavior: MessageHandlerErrorBehavior): MessageErrorHandler {
    switch (behavior) {
      case "ACK":
        return (_channel: unknown, msg: ConsumeMessage) => {
          this.channel?.ack(msg);
        };
      case "REQUEUE":
        return (_channel: unknown, msg: ConsumeMessage) => {
          this.channel?.nack(msg, false, true);
        };
      case "NACK":
      default:
        return (_channel: unknown, msg: ConsumeMessage) => {
          this.channel?.nack(msg, false, false);
        };
    }
  }

  // ── Private: handler config merging ───────────────────────────────

  /**
   * Merge decorator-level config with module-level handler configs.
   * Module-level config takes precedence.
   */
  private mergeHandlerConfig<T extends RabbitSubscribeOptions>(options: T): T {
    if (!options.name || !this.config.handlers) {
      return options;
    }

    const handlerConfigs = this.config.handlers[options.name];
    if (!handlerConfigs) return options;

    const moduleConfig = Array.isArray(handlerConfigs) ? handlerConfigs[0] : handlerConfigs;
    if (!moduleConfig) return options;

    return { ...options, ...moduleConfig } as T;
  }

  // ── Private: parameter injection ──────────────────────────────────

  /**
   * Build handler arguments based on @RabbitPayload, @RabbitHeader, @RabbitRequest decorators.
   */
  private buildHandlerArgs(
    instance: object,
    methodName: string | symbol,
    message: unknown,
    rawMessage: ConsumeMessage,
    headers: Record<string, unknown>,
  ): unknown[] {
    const payloadParams = Reflect.getMetadata(RABBIT_PAYLOAD_METADATA, instance, methodName) || [];
    const headerParams = Reflect.getMetadata(RABBIT_HEADER_METADATA, instance, methodName) || [];
    const requestParams = Reflect.getMetadata(RABBIT_REQUEST_METADATA, instance, methodName) || [];

    const allParams = [...payloadParams, ...headerParams, ...requestParams];

    // No parameter decorators — pass message as first arg (backward compatible)
    if (allParams.length === 0) {
      return [message, rawMessage, headers];
    }

    const args: unknown[] = [];

    for (const param of allParams) {
      let value: unknown;
      switch (param.type) {
        case 3: // RABBIT_PARAM_TYPE (payload)
          value = param.propertyKey && message != null
            ? (message as Record<string, unknown>)[param.propertyKey]
            : message;
          break;
        case 4: // RABBIT_HEADER_TYPE
          value = param.propertyKey
            ? headers[param.propertyKey]
            : headers;
          break;
        case 5: // RABBIT_REQUEST_TYPE
          value = param.propertyKey
            ? (rawMessage as unknown as Record<string, unknown>)[param.propertyKey]
            : rawMessage;
          break;
      }
      args[param.index] = value;
    }

    return args;
  }

  // ── Private: subscribe handler setup ──────────────────────────────

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

    if (!queue) return;

    // Assert and bind queue (exchanges are asserted during connect())
    const actualQueue = await this.assertQueue({
      name: queue,
      options: options.queueOptions,
      bindings: routingKeys.map((rk) => ({ exchange, routingKey: rk })),
    });

    const errorHandler = this.getErrorHandler(options);

    if (!this.channel) return;

    const { consumerTag } = await this.channel.consume(
      actualQueue,
      this.wrapConsumer(async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          const { message, headers } = this.deserializeMessage(msg, options);
          const method = (instance as Record<string | symbol, Function>)[methodName];
          const args = this.buildHandlerArgs(instance, methodName, message, msg, headers);
          const response = await method.apply(instance, args);

          // Handle Nack return
          if (response instanceof Nack) {
            this.channel?.nack(msg, false, response.requeue);
            return;
          }

          // If handler returns something non-void for subscribe, warn
          if (response !== undefined && response !== null) {
            this.logger.warn(
              `Received response from subscribe handler [${handlerName}.${String(methodName)}]. ` +
              `Subscribe handlers should only return void`,
            );
          }

          this.channel?.ack(msg);
        } catch (error) {
          this.logger.error(`Error in ${handlerName}.${String(methodName)}:`, error);
          await errorHandler(this.channel!, msg, error);
        }
      }),
      options.queueOptions?.consumerOptions,
    );

    // Register consumer for cancel/resume
    this._consumers.set(consumerTag, {
      type: "subscribe",
      consumerTag,
      handler: (instance as Record<string | symbol, Function>)[methodName],
      msgOptions: options,
      instance,
      methodName,
      handlerName,
    });
  }

  // ── Private: batch subscribe handler setup ────────────────────────

  private async setupBatchSubscribeHandler(
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
    const batch = options.batch!;

    const batchSize = batch.size || DEFAULT_BATCH_SIZE;
    const batchTimeout = batch.timeout ?? DEFAULT_BATCH_TIMEOUT;

    if (batchSize < 2) {
      this.logger.warn(`Batch size should be >= 2, got ${batchSize}. Using 2.`);
    }

    this.logger.log(
      `${handlerName}.${String(methodName)} {batch-subscribe} -> ${exchange}::${routingKeys.join(",")}::${queue} (batch: ${batchSize}, timeout: ${batchTimeout}ms)`,
    );

    if (!queue) return;

    const actualQueue = await this.assertQueue({
      name: queue,
      options: options.queueOptions,
      bindings: routingKeys.map((rk) => ({ exchange, routingKey: rk })),
    });

    const errorHandler = this.getErrorHandler(options);
    const batchErrorHandler = batch.errorHandler;

    const state: BatchState = {
      messages: [],
      timer: null,
      options: batch,
      handler: (instance as Record<string | symbol, Function>)[methodName],
      instance,
      methodName,
      handlerName,
      subscribeOptions: options,
    };

    this._batchStates.set(actualQueue, state);

    const processBatch = async () => {
      if (state.timer) {
        clearTimeout(state.timer);
        state.timer = null;
      }

      const msgs = state.messages.splice(0);
      if (msgs.length === 0) return;

      try {
        const deserialized = msgs.map((m) => this.deserializeMessage(m, options));
        const payloads = deserialized.map((d) => d.message);
        const headers = deserialized.map((d) => d.headers);
        const rawMessages = msgs;

        const method = (instance as Record<string | symbol, Function>)[methodName];
        const response = await method.call(instance, payloads, rawMessages, headers);

        if (response instanceof Nack) {
          for (const m of msgs) this.channel?.nack(m, false, response.requeue);
          return;
        }

        for (const m of msgs) this.channel?.ack(m);
      } catch (error) {
        this.logger.error(`Error in batch ${handlerName}.${String(methodName)}:`, error);
        if (batchErrorHandler) {
          await batchErrorHandler(this.channel!, msgs, error);
        } else {
          for (const m of msgs) await errorHandler(this.channel!, m, error);
        }
      }
    };

    if (!this.channel) return;

    const { consumerTag } = await this.channel.consume(
      actualQueue,
      this.wrapConsumer(async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        state.messages.push(msg);

        if (state.messages.length >= Math.max(batchSize, 2)) {
          await processBatch();
        } else if (!state.timer) {
          state.timer = setTimeout(() => {
            processBatch().catch((err) => {
              this.logger.error("Error processing batch:", err);
            });
          }, batchTimeout);
        }
      }),
      options.queueOptions?.consumerOptions,
    );

    this._consumers.set(consumerTag, {
      type: "batch",
      consumerTag,
      handler: (instance as Record<string | symbol, Function>)[methodName],
      msgOptions: options,
      instance,
      methodName,
      handlerName,
    });
  }

  // ── Private: RPC handler setup ────────────────────────────────────

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

    if (!queue) return;

    const entry: RpcHandlerEntry = {
      routingKey: options.routingKey,
      handler: (instance as Record<string | symbol, Function>)[methodName],
      rpcOptions: options,
      instance,
      methodName,
      handlerName,
    };

    // Support multiple RPC handlers per queue
    if (!this._rpcHandlersByQueue.has(queue)) {
      this._rpcHandlersByQueue.set(queue, []);
    }
    this._rpcHandlersByQueue.get(queue)!.push(entry);

    // If there's already a consumer for this queue, just bind the queue
    if (this._rpcConsumerTagByQueue.has(queue)) {
      await this.assertQueue({
        name: queue,
        options: options.queueOptions,
        bindings: routingKeys.map((rk) => ({ exchange, routingKey: rk })),
      });
      return;
    }

    // First handler for this queue — set up consumer
    const actualQueue = await this.assertQueue({
      name: queue,
      options: options.queueOptions,
      bindings: routingKeys.map((rk) => ({ exchange, routingKey: rk })),
    });

    if (!this.channel) return;

    const errorHandler = this.getErrorHandler(options, true);

    const { consumerTag } = await this.channel.consume(
      actualQueue,
      this.wrapConsumer(async (msg: ConsumeMessage | null) => {
        if (!msg) return;

        try {
          // Find the matching handler by routing key
          const handlers = this._rpcHandlersByQueue.get(queue) || [];
          const matched = this.findRpcHandler(handlers, msg.fields.routingKey);

          if (!matched) {
            this.channel?.nack(msg, false, false);
            this.logger.error(
              `No RPC handler found for routing key "${msg.fields.routingKey}" on queue "${queue}"`,
            );
            return;
          }

          const { message, headers } = this.deserializeMessage(msg, matched.rpcOptions);
          const args = this.buildHandlerArgs(
            matched.instance,
            matched.methodName,
            message,
            msg,
            headers,
          );
          const response = await matched.handler.apply(matched.instance, args);

          // Handle Nack return
          if (response instanceof Nack) {
            this.channel?.nack(msg, false, response.requeue);
            return;
          }

          // Send RPC reply if replyTo is set
          const { replyTo, correlationId, expiration, headers: msgHeaders } = msg.properties;
          if (replyTo && this.publisherChannel) {
            const content = this.serializeMessage(response);
            this.publisherChannel.sendToQueue(replyTo, content, {
              correlationId,
              expiration,
              headers: msgHeaders,
              persistent: matched.rpcOptions.usePersistentReplyTo ?? false,
            });
          }

          this.channel?.ack(msg);
        } catch (error) {
          this.logger.error(`Error in RPC handler for queue "${queue}":`, error);
          await errorHandler(this.channel!, msg, error);
        }
      }),
      options.queueOptions?.consumerOptions,
    );

    this._rpcConsumerTagByQueue.set(queue, consumerTag);

    this._consumers.set(consumerTag, {
      type: "rpc",
      consumerTag,
      handler: entry.handler,
      msgOptions: options,
      instance,
      methodName,
      handlerName,
    });
  }

  /**
   * Find the matching RPC handler for a given routing key.
   * Exact match first, then wildcard pattern matching.
   */
  private findRpcHandler(
    handlers: RpcHandlerEntry[],
    routingKey: string,
  ): RpcHandlerEntry | null {
    // Exact match
    for (const entry of handlers) {
      const keys = Array.isArray(entry.routingKey) ? entry.routingKey : [entry.routingKey];
      if (keys.includes(routingKey)) return entry;
    }

    // Wildcard pattern matching
    for (const entry of handlers) {
      if (matchesRoutingKey(routingKey, entry.routingKey)) return entry;
    }

    // If only one handler, use it as fallback
    if (handlers.length === 1) return handlers[0];

    return null;
  }

  // ── Private: Direct Reply-To ──────────────────────────────────────

  private async initDirectReplyQueue(): Promise<void> {
    if (!this.channel) return;

    try {
      const { consumerTag } = await this.channel.consume(
        DIRECT_REPLY_QUEUE,
        (msg: ConsumeMessage | null) => {
          if (!msg) return;

          const correlationId = msg.properties.correlationId;
          if (!correlationId) return;

          const pending = this._rpcResponseHandlers.get(correlationId);
          if (pending) {
            clearTimeout(pending.timeoutId);
            this._rpcResponseHandlers.delete(correlationId);

            try {
              const content = this.serializer.parse(msg.content);
              if (Buffer.isBuffer(content)) {
                pending.resolve(content);
              } else {
                pending.resolve(content);
              }
            } catch (err) {
              pending.reject(err);
            }
          }
        },
        { noAck: true },
      );

      this._directReplyConsumerTag = consumerTag;
    } catch {
      // Direct Reply-To not supported (some brokers don't support it)
      this.logger.warn("Direct Reply-To queue not available, falling back to temporary queues for RPC");
      this._directReplyConsumerTag = null;
    }
  }

  private async requestViaDirectReplyTo<T, R>(
    exchange: string,
    routingKey: string,
    payload: T,
    correlationId: string,
    timeout: number,
    headers?: Record<string, unknown>,
  ): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this._rpcResponseHandlers.delete(correlationId);
        reject(new Error(`RPC request timeout after ${timeout}ms`));
      }, timeout);

      this._rpcResponseHandlers.set(correlationId, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timeoutId,
      });

      const content = this.serializeMessage(payload);
      const published = this.publisherChannel!.publish(
        this.getExchangeName(exchange),
        routingKey,
        content,
        {
          correlationId,
          replyTo: DIRECT_REPLY_QUEUE,
          headers,
          persistent: false,
        },
      );

      if (!published) {
        clearTimeout(timeoutId);
        this._rpcResponseHandlers.delete(correlationId);
        reject(new Error("Failed to publish RPC request"));
      }
    });
  }

  private async requestViaTemporaryQueue<T, R>(
    exchange: string,
    routingKey: string,
    payload: T,
    correlationId: string,
    timeout: number,
    headers?: Record<string, unknown>,
  ): Promise<R> {
    if (!this.channel) {
      throw new Error("RabbitMQ channel not available");
    }

    const { queue: replyQueue } = await this.channel.assertQueue("", {
      exclusive: true,
      autoDelete: true,
    });

    let consumerInfo: Replies.Consume | null = null;

    return new Promise<R>((resolve, reject) => {
      const cleanup = async (): Promise<void> => {
        if (consumerInfo) {
          try { await this.channel?.cancel(consumerInfo.consumerTag); } catch { /* ignore */ }
        }
        try { await this.channel?.deleteQueue(replyQueue); } catch { /* ignore */ }
      };

      const timeoutId = setTimeout(() => {
        cleanup().catch(() => {});
        reject(new Error(`RPC request timeout after ${timeout}ms`));
      }, timeout);

      this.channel!.consume(
        replyQueue,
        (msg: ConsumeMessage | null) => {
          if (!msg) return;
          if (msg.properties.correlationId === correlationId) {
            clearTimeout(timeoutId);
            cleanup().catch(() => {});
            const content = this.serializer.parse<R>(msg.content);
            resolve(Buffer.isBuffer(content) ? (content as unknown as R) : content);
          }
        },
        { noAck: true },
      )
        .then((consumer) => {
          consumerInfo = consumer;
          const content = this.serializeMessage(payload);
          const published = this.channel!.publish(
            this.getExchangeName(exchange),
            routingKey,
            content,
            { correlationId, replyTo: replyQueue, headers, persistent: false },
          );
          if (!published) {
            clearTimeout(timeoutId);
            cleanup().catch(() => {});
            reject(new Error("Failed to publish RPC request"));
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          cleanup().catch(() => {});
          reject(error);
        });
    });
  }
}

/**
 * Alias for AmqpConnection for backward compatibility
 * @deprecated Use AmqpConnection instead
 */
export const RabbitMQService = AmqpConnection;

// ── Routing key pattern matching ──────────────────────────────────

/**
 * Match a routing key against an AMQP routing key pattern.
 * Supports: exact match, single word wildcard (*), multi word wildcard (#).
 */
function matchesRoutingKey(
  routingKey: string,
  pattern: string | string[] | undefined,
): boolean {
  if (pattern === undefined || pattern === null) return true;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  return patterns.some((p) => matchSinglePattern(routingKey, p));
}

function matchSinglePattern(routingKey: string, pattern: string): boolean {
  if (routingKey === pattern) return true;
  const routingParts = routingKey.split(".");
  const patternParts = pattern.split(".");
  return matchParts(routingParts, 0, patternParts, 0);
}

function matchParts(
  routingParts: string[],
  ri: number,
  patternParts: string[],
  pi: number,
): boolean {
  if (ri === routingParts.length && pi === patternParts.length) return true;
  if (pi === patternParts.length) return false;

  const patternPart = patternParts[pi];

  if (patternPart === "#") {
    if (pi === patternParts.length - 1) return true;
    for (let i = ri; i <= routingParts.length; i++) {
      if (matchParts(routingParts, i, patternParts, pi + 1)) return true;
    }
    return false;
  }

  if (ri === routingParts.length) return false;

  if (patternPart === "*") {
    return matchParts(routingParts, ri + 1, patternParts, pi + 1);
  }

  if (routingParts[ri] === patternPart) {
    return matchParts(routingParts, ri + 1, patternParts, pi + 1);
  }

  return false;
}
