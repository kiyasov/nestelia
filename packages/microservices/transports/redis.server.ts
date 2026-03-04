import { randomUUID } from "node:crypto";

import type RedisType from "ioredis";

import type { MessageHandler, RedisOptions } from "../interfaces";
import { BaseServer } from "./server";

type RedisClientType = RedisType;

// eslint-disable-next-line @typescript-eslint/no-require-imports
let Redis: typeof RedisType | undefined;

try {
  // Dynamic import keeps ioredis an optional peer dependency.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Redis = require("ioredis").default;
} catch {
  // ioredis not installed – error is thrown lazily in the constructor.
}

/**
 * Transport server that uses Redis Pub/Sub for message passing.
 *
 * - Request-response: client publishes to `<pattern>`, server publishes the
 *   response to `<pattern>.reply` with the originating request `id`.
 * - Fire-and-forget: client publishes to `<pattern>` without an `id` field.
 *
 * Requires the optional peer dependency `ioredis`.
 */
export class RedisServer extends BaseServer {
  private subClient?: RedisClientType;
  private pubClient?: RedisClientType;

  /** Tracks Redis channels the subscriber is already subscribed to. */
  private readonly subscribedChannels = new Set<string>();

  private isConnected = false;

  constructor(private readonly options: RedisOptions) {
    super();
    if (!Redis) {
      throw new Error(
        "ioredis is required to use the Redis transport. " +
          "Install it with: bun add ioredis",
      );
    }
  }

  /**
   * Establishes Redis subscriber and publisher connections then subscribes to
   * all registered pattern channels.
   */
  public listen(callback?: (err?: unknown) => void): void {
    try {
      const baseOptions: RedisType["options"] = {
        host: this.options.host ?? "localhost",
        port: this.options.port ?? 6379,
        password: this.options.password,
        db: this.options.db ?? 0,
        retryStrategy: (times: number) => {
          const maxRetries = this.options.retryAttempts ?? 3;
          const delay = this.options.retryDelay ?? 1000;
          return times > maxRetries ? null : delay * times;
        },
      };

      const RedisCtor = Redis!;

      this.subClient = this.options.url
        ? new RedisCtor(this.options.url, baseOptions)
        : new RedisCtor(baseOptions);

      this.pubClient = this.options.url
        ? new RedisCtor(this.options.url, baseOptions)
        : new RedisCtor(baseOptions);

      this.subClient.on("message", (channel: string, message: string) => {
        void this.handleRedisMessage(channel, message);
      });

      this.subClient.on("error", (err: Error) => this.emit("error", err));
      this.pubClient.on("error", (err: Error) => this.emit("error", err));

      this.subClient.on("connect", () => {
        this.isConnected = true;
        this.subscribeToRegisteredPatterns();
        this.emit("ready");
        callback?.();
      });
    } catch (err) {
      if (callback) {
        callback(err);
      } else {
        throw err;
      }
    }
  }

  /**
   * Subscribes the sub-client to all currently registered handler patterns.
   * Must only be called after the client is connected.
   */
  private subscribeToRegisteredPatterns(): void {
    for (const pattern of this.messageHandlers.keys()) {
      this.subscribeChannel(pattern);
    }
    for (const pattern of this.eventHandlers.keys()) {
      this.subscribeChannel(pattern);
    }
  }

  /** Subscribes to `channel` if not already subscribed. */
  private subscribeChannel(channel: string): void {
    if (!this.subscribedChannels.has(channel)) {
      this.subClient!.subscribe(channel);
      this.subscribedChannels.add(channel);
    }
  }

  public override addMessageHandler(
    pattern: string,
    callback: MessageHandler,
  ): void {
    super.addMessageHandler(pattern, callback);
    if (this.isConnected) {
      this.subscribeChannel(pattern);
    }
  }

  public override addEventHandler(
    pattern: string,
    callback: MessageHandler,
  ): void {
    super.addEventHandler(pattern, callback);
    if (this.isConnected) {
      this.subscribeChannel(pattern);
    }
  }

  private async handleRedisMessage(
    channel: string,
    rawMessage: string,
  ): Promise<void> {
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(rawMessage) as Record<string, unknown>;
    } catch {
      this.emit("error", new Error(`Invalid JSON on channel "${channel}"`));
      return;
    }

    const ctx: Record<string, unknown> = {
      pattern: channel,
      channel,
      transport: "redis",
    };

    try {
      if (this.messageHandlers.has(channel)) {
        const response = await this.handleMessage(
          channel,
          parsed.data ?? parsed,
          ctx,
        );

        // Only reply when the request carries a correlation id.
        if (typeof parsed.id === "string" && this.pubClient) {
          await this.pubClient.publish(
            `${channel}.reply`,
            JSON.stringify({ id: parsed.id, data: response }),
          );
        }
      } else if (this.eventHandlers.has(channel)) {
        this.handleEvent(channel, parsed.data ?? parsed, ctx);
      }
    } catch (err) {
      this.emit("error", err);
    }
  }

  /**
   * Sends a request to `pattern` and waits for a reply.
   * The default timeout is **5 seconds**.
   */
  public sendMessage<T = unknown>(pattern: string, data: T): Promise<unknown> {
    if (!this.pubClient || !this.subClient) {
      return Promise.reject(new Error("Redis client not initialized"));
    }

    const requestId = randomUUID();
    const replyChannel = `${pattern}.reply`;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Request timeout for pattern: "${pattern}"`));
      }, 5_000);

      const onMessage = (channel: string, raw: string): void => {
        if (channel !== replyChannel) return;
        try {
          const reply = JSON.parse(raw) as Record<string, unknown>;
          if (reply.id === requestId) {
            cleanup();
            resolve(reply.data);
          }
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      const cleanup = (): void => {
        clearTimeout(timer);
        this.subClient!.unsubscribe(replyChannel);
        this.subClient!.off("message", onMessage);
        this.subscribedChannels.delete(replyChannel);
      };

      this.subClient!.subscribe(replyChannel);
      this.subscribedChannels.add(replyChannel);
      this.subClient!.on("message", onMessage);

      void this.pubClient!.publish(
        pattern,
        JSON.stringify({ id: requestId, data }),
      );
    });
  }

  /** Publishes a fire-and-forget event to `pattern`. */
  public emitEvent<T = unknown>(pattern: string, data: T): void {
    if (!this.pubClient) {
      throw new Error("Redis client not initialized");
    }
    void this.pubClient.publish(pattern, JSON.stringify({ data }));
  }

  /** Disconnects both Redis clients and clears subscriptions. */
  public close(): void {
    this.subClient?.disconnect();
    this.pubClient?.disconnect();
    this.isConnected = false;
    this.subscribedChannels.clear();
  }
}
