import { randomUUID } from "node:crypto";

import type RedisType from "ioredis";
import { Observable, type Observer } from "rxjs";

import type { RedisOptions } from "../interfaces";
import { ClientProxy } from "./client-proxy";

type RedisClientType = RedisType;

// eslint-disable-next-line @typescript-eslint/no-require-imports
let Redis: typeof RedisType | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Redis = require("ioredis").default;
} catch {
  // ioredis not installed – error is thrown lazily in the constructor.
}

/**
 * Client proxy that communicates over Redis Pub/Sub.
 *
 * - {@link send}: publishes to `<pattern>` with a unique `id` and subscribes
 *   to `<pattern>.reply` for the correlated response.
 * - {@link emit}: publishes to `<pattern>` without an `id`.
 *
 * Requires the optional peer dependency `ioredis`.
 */
export class RedisClient extends ClientProxy {
  private pubClient?: RedisClientType;
  private subClient?: RedisClientType;

  /** Pending request id → resolve callback. */
  private readonly pendingRequests = new Map<
    string,
    (value: unknown) => void
  >();

  /** Reply channels the sub-client is already subscribed to. */
  private readonly replyChannels = new Set<string>();

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

  /** Opens publisher and subscriber connections. */
  async connect(): Promise<void> {
    const baseOptions: RedisType["options"] = {
      host: this.options.host ?? "localhost",
      port: this.options.port ?? 6379,
      password: this.options.password,
      db: this.options.db ?? 0,
    };

    const RedisCtor = Redis!;

    this.pubClient = this.options.url
      ? new RedisCtor(this.options.url, baseOptions)
      : new RedisCtor(baseOptions);

    this.subClient = this.options.url
      ? new RedisCtor(this.options.url, baseOptions)
      : new RedisCtor(baseOptions);

    this.subClient.on("message", (channel: string, raw: string) => {
      this.handleReplyMessage(channel, raw);
    });

    await Promise.all([
      new Promise<void>((resolve) => this.pubClient!.once("connect", resolve)),
      new Promise<void>((resolve) => this.subClient!.once("connect", resolve)),
    ]);

    this.isConnected = true;
  }

  private handleReplyMessage(channel: string, raw: string): void {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const id = parsed.id as string | undefined;
      if (id) {
        const resolve = this.pendingRequests.get(id);
        if (resolve) {
          resolve(parsed.data);
          this.pendingRequests.delete(id);
        }
      }
    } catch {
      // Discard malformed reply messages.
    }
  }

  /**
   * Sends a request to `pattern` and returns an Observable that emits the
   * response then completes. Times out after **5 seconds**.
   */
  send<T = unknown, R = unknown>(pattern: string, data: T): Observable<R> {
    return new Observable((observer: Observer<R>) => {
      if (!this.isConnected) {
        observer.error(new Error("Redis client is not connected"));
        return;
      }

      const id = randomUUID();
      const replyChannel = `${pattern}.reply`;

      if (!this.replyChannels.has(replyChannel)) {
        this.subClient!.subscribe(replyChannel);
        this.replyChannels.add(replyChannel);
      }

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        observer.error(new Error(`Request timeout for pattern: "${pattern}"`));
      }, 5_000);

      this.pendingRequests.set(id, (response: unknown) => {
        clearTimeout(timer);
        observer.next(response as R);
        observer.complete();
      });

      void this.pubClient!.publish(pattern, JSON.stringify({ id, data }));
    });
  }

  /** Publishes a fire-and-forget event to `pattern`. */
  emit<T = unknown>(pattern: string, data: T): void {
    if (!this.isConnected) {
      throw new Error("Redis client is not connected");
    }
    void this.pubClient!.publish(pattern, JSON.stringify({ data }));
  }

  /** Disconnects both Redis clients and clears pending state. */
  close(): void {
    this.pubClient?.removeAllListeners();
    this.pubClient?.disconnect();
    this.subClient?.removeAllListeners();
    this.subClient?.disconnect();
    this.isConnected = false;
    this.replyChannels.clear();
    this.pendingRequests.clear();
  }
}
