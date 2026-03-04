import type { Redis, RedisOptions } from "ioredis";

/** Options for creating a {@link RedisPubSub} instance. */
export interface RedisPubSubOptions {
  /** Key prefix prepended to every Redis channel name. */
  keyPrefix?: string;
  /** Pre-existing Redis client used for publishing. */
  publisher?: Redis;
  /** Pre-existing Redis client used for subscribing. */
  subscriber?: Redis;
  /**
   * ioredis connection options used when `publisher`/`subscriber` are not
   * provided.
   */
  connection?: RedisOptions;
  /**
   * Called when the publisher/subscriber connections are established or fail.
   * `undefined` is passed on successful connect, an `Error` on failure.
   */
  connectionListener?: (err: Error | undefined) => void;
  /** Transforms a trigger name before it is used as the Redis channel key. */
  triggerTransform?: TriggerTransform;
  /**
   * Optional JSON `reviver` function passed to `JSON.parse` when
   * deserialising incoming messages (used only when `deserializer` is not
   * provided).
   */
  reviver?: (key: string, value: unknown) => unknown;
  /** Custom serializer for outgoing message payloads. Defaults to `JSON.stringify`. */
  serializer?: (payload: unknown) => string;
  /** Custom deserializer for incoming message payloads. Defaults to `JSON.parse`. */
  deserializer?: (payload: string) => unknown;
}

/**
 * A function that maps a trigger name (plus subscription options) to the
 * Redis channel key that will actually be subscribed to.
 */
export type TriggerTransform = (
  trigger: string,
  options: SubscriptionOptions,
) => string;

/** Options passed when subscribing to a trigger. */
export interface SubscriptionOptions {
  /** When `true`, use Redis pattern-subscribe (`PSUBSCRIBE`) instead of `SUBSCRIBE`. */
  pattern?: boolean;
}

/** Callback invoked whenever a message arrives on a subscribed trigger. */
export type MessageHandler<T = unknown> = (message: T) => void;

/** Core PubSub contract that {@link RedisPubSub} implements. */
export interface PubSubEngine {
  publish(triggerName: string, payload: unknown): Promise<void>;
  subscribe(
    triggerName: string,
    onMessage: MessageHandler,
    options?: SubscriptionOptions,
  ): Promise<number>;
  unsubscribe(subId: number): void;
  asyncIterator<T>(triggers: string | string[]): AsyncIterator<T>;
}

/** Metadata stored per active subscription. */
export interface SubscriptionEvent<T = unknown> {
  /** Unique subscription identifier. */
  id: number;
  /** Resolved Redis channel / pattern key. */
  trigger: string;
  /** Message callback. */
  handler: MessageHandler<T>;
  /** Whether this subscription uses Redis pattern-subscribe. */
  isPattern: boolean;
}

/** `subId → SubscriptionEvent` map. */
export type SubscriptionMap = Map<number, SubscriptionEvent>;

/** `channel → [subId, …]` map for fan-out dispatch. */
export type SubsRefsMap = Map<string, number[]>;
