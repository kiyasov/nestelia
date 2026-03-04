import type { PubSubEngine, SubscriptionOptions } from "./interfaces";

/** Maximum number of unconsumed messages queued before oldest are dropped. */
const MAX_QUEUE_SIZE = 1_000;

type ResolveCallback<T> = (value: IteratorResult<T>) => void;

/**
 * Async iterator for GraphQL subscriptions backed by a {@link PubSubEngine}.
 *
 * Implements the `AsyncIterator` / `AsyncIterable` protocols so it can be
 * used directly in GraphQL resolvers:
 *
 * ```typescript
 * yield* pubsub.asyncIterator<MyEvent>("MY_EVENT");
 * ```
 *
 * Internally it maintains two queues:
 * - **pullQueue** – pending `next()` promises waiting for a message.
 * - **pushQueue** – messages that arrived before `next()` was called.
 *
 * To prevent unbounded memory growth the push-queue is capped at
 * {@link MAX_QUEUE_SIZE}; oldest entries are dropped when the limit is
 * exceeded (similar to a lossy channel).
 */
export class PubSubAsyncIterator<T> implements AsyncIterator<T> {
  private readonly pubsub: PubSubEngine;
  private readonly triggers: string[];
  private readonly options?: SubscriptionOptions;

  /** Active subscription IDs returned by the pubsub engine. */
  private subscriptionIds: number[] | undefined;
  /** Pending `next()` resolvers waiting for a message. */
  private pullQueue: ResolveCallback<T>[] = [];
  /** Messages received before `next()` was called. */
  private pushQueue: T[] = [];
  /** `false` once {@link return} or {@link throw} has been called. */
  private listening = true;

  constructor(
    pubsub: PubSubEngine,
    triggers: string[],
    options?: SubscriptionOptions,
  ) {
    this.pubsub = pubsub;
    this.triggers = triggers;
    this.options = options;

    // Subscribe immediately; errors are logged but do not throw synchronously.
    this.subscribeAll().catch((err: unknown) => {
      console.error("[PubSubAsyncIterator] Failed to subscribe:", err);
    });
  }

  /** Returns the next message, waiting if none is buffered yet. */
  public async next(): Promise<IteratorResult<T>> {
    if (this.pushQueue.length > 0) {
      return { value: this.pushQueue.shift()!, done: false };
    }

    return new Promise<IteratorResult<T>>((resolve) => {
      if (this.listening) {
        this.pullQueue.push(resolve);
      } else {
        resolve({ value: undefined as unknown as T, done: true });
      }
    });
  }

  /** Terminates the iterator and unsubscribes from all triggers. */
  public async return(): Promise<IteratorResult<T>> {
    await this.unsubscribeAll();
    return { value: undefined as unknown as T, done: true };
  }

  /** Terminates the iterator, unsubscribes, then re-throws `error`. */
  public async throw(error: unknown): Promise<IteratorResult<T>> {
    await this.unsubscribeAll();
    return Promise.reject(error);
  }

  /** Makes this object usable in `for await…of` loops. */
  public [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }

  /**
   * Called by the pubsub engine when a message arrives.
   *
   * If a `next()` call is already waiting, resolves it immediately.
   * Otherwise enqueues the message (up to {@link MAX_QUEUE_SIZE}).
   */
  private pushValue(value: T): void {
    if (!this.listening) return;

    if (this.pullQueue.length > 0) {
      const resolve = this.pullQueue.shift()!;
      resolve({ value, done: false });
    } else {
      if (this.pushQueue.length >= MAX_QUEUE_SIZE) {
        // Drop oldest message to prevent unbounded memory growth.
        this.pushQueue.shift();
      }
      this.pushQueue.push(value);
    }
  }

  /** Subscribes to all configured triggers. No-op if already subscribed. */
  private async subscribeAll(): Promise<void> {
    if (this.subscriptionIds) return;

    this.subscriptionIds = await Promise.all(
      this.triggers.map((trigger) =>
        this.pubsub.subscribe(
          trigger,
          (message) => this.pushValue(message as T),
          this.options,
        ),
      ),
    );
  }

  /** Unsubscribes from all triggers and drains both queues. */
  private async unsubscribeAll(): Promise<void> {
    if (!this.subscriptionIds) return;

    for (const subId of this.subscriptionIds) {
      this.pubsub.unsubscribe(subId);
    }

    this.subscriptionIds = undefined;
    this.listening = false;

    // Drain the pull queue so callers awaiting next() get done = true.
    for (const resolve of this.pullQueue) {
      resolve({ value: undefined as unknown as T, done: true });
    }

    this.pullQueue = [];
    this.pushQueue = [];
  }
}
