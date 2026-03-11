import { Injectable } from "nestelia";

import type { EventEmitterModuleOptions } from "./interfaces";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventHandler<T = unknown> = (payload: T) => any;

interface HandlerRegistration<T = unknown> {
  pattern: string | symbol;
  handler: EventHandler<T>;
  once: boolean;
}

/**
 * Returns true when `event` (string) matches `pattern`.
 *
 * Rules (only applies when wildcard mode is enabled):
 * - `**`  — matches everything
 * - `*`   — matches any single segment (no delimiter)
 * - `foo.*` — matches `foo.bar`, `foo.baz` …
 * - exact — no wildcards, must be identical
 */
function matchWildcard(pattern: string, event: string, delimiter: string): boolean {
  if (pattern === event) return true;

  const escaped = delimiter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexStr = pattern
    .split(delimiter)
    .map((seg) => {
      if (seg === "**") return ".*";
      if (seg === "*") return `[^${escaped}]+`;
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join(escaped);

  return new RegExp(`^${regexStr}$`).test(event);
}

/**
 * Injectable event emitter service.
 *
 * Supports synchronous and asynchronous handlers, wildcard patterns,
 * and typed events. Use `@InjectEventEmitter()` or `@Inject(EVENT_EMITTER_TOKEN)`
 * to inject this service.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class OrderService {
 *   constructor(private readonly events: EventEmitterService) {}
 *
 *   async placeOrder(order: Order) {
 *     await this.events.emitAsync('order.created', order);
 *   }
 * }
 * ```
 *
 */
@Injectable()
export class EventEmitterService {
  private readonly handlers: HandlerRegistration[] = [];
  private readonly wildcard: boolean;
  private readonly delimiter: string;
  private readonly maxListeners: number;

  constructor(options: EventEmitterModuleOptions = {}) {
    this.wildcard = options.wildcard ?? false;
    this.delimiter = options.delimiter ?? ".";
    this.maxListeners = options.maxListeners ?? 10;
  }

  /**
   * Emit an event synchronously. Returns `true` if at least one handler was
   * invoked (async handlers are fired but not awaited — use `emitAsync` if
   * you need to wait for them).
   */
  emit(event: string | symbol, payload?: unknown): boolean {
    const matched = this.getMatching(event);
    if (matched.length === 0) return false;

    const toRemove: HandlerRegistration[] = [];

    for (const reg of matched) {
      try {
        reg.handler(payload);
      } catch {
        // swallow — mirrors Node EventEmitter behaviour
      }
      if (reg.once) toRemove.push(reg);
    }

    this.removeRegistrations(toRemove);
    return true;
  }

  /**
   * Emit an event and await all async handlers.
   * Returns an array of values resolved by each handler.
   */
  async emitAsync(event: string | symbol, payload?: unknown): Promise<unknown[]> {
    const matched = this.getMatching(event);
    if (matched.length === 0) return [];

    const toRemove: HandlerRegistration[] = [];
    const results = await Promise.all(
      matched.map(async (reg) => {
        try {
          const result = await reg.handler(payload);
          if (reg.once) toRemove.push(reg);
          return result;
        } catch (err) {
          console.error(
            `Error in event handler for "${String(event)}":`,
            err,
          );
          return undefined;
        }
      }),
    );

    this.removeRegistrations(toRemove);
    return results as unknown[];
  }

  /**
   * Register a persistent event handler.
   */
  on<T = unknown>(
    event: string | symbol,
    handler: EventHandler<T>,
  ): this {
    this.addRegistration(event, handler as EventHandler, false);
    return this;
  }

  /**
   * Register a one-time event handler.
   */
  once<T = unknown>(
    event: string | symbol,
    handler: EventHandler<T>,
  ): this {
    this.addRegistration(event, handler as EventHandler, true);
    return this;
  }

  /**
   * Remove a specific handler (or all handlers for an event when omitted).
   */
  off<T = unknown>(
    event: string | symbol,
    handler?: EventHandler<T>,
  ): this {
    if (!handler) {
      const before = this.handlers.length;
      this.handlers.splice(0, before, ...this.handlers.filter((r) => r.pattern !== event));
    } else {
      const idx = this.handlers.findIndex(
        (r) => r.pattern === event && r.handler === (handler as EventHandler),
      );
      if (idx !== -1) this.handlers.splice(idx, 1);
    }
    return this;
  }

  /**
   * Remove all listeners, optionally scoped to a specific event.
   */
  removeAllListeners(event?: string | symbol): this {
    if (event === undefined) {
      this.handlers.splice(0);
    } else {
      this.handlers.splice(
        0,
        this.handlers.length,
        ...this.handlers.filter((r) => r.pattern !== event),
      );
    }
    return this;
  }

  /**
   * Returns the number of handlers registered for `event`.
   */
  listenerCount(event: string | symbol): number {
    return this.getMatching(event).length;
  }

  // ─── internal ─────────────────────────────────────────────────────────────

  private addRegistration(
    pattern: string | symbol,
    handler: EventHandler,
    once: boolean,
  ): void {
    if (
      typeof pattern === "string" &&
      this.handlers.filter((r) => r.pattern === pattern).length >= this.maxListeners
    ) {
      console.warn(
        `[EventEmitterService] Possible memory leak: ${this.maxListeners}+ listeners for "${pattern}". ` +
          `Increase maxListeners via EventEmitterModule.forRoot({ maxListeners: N }).`,
      );
    }
    this.handlers.push({ pattern, handler, once });
  }

  private getMatching(event: string | symbol): HandlerRegistration[] {
    return this.handlers.filter((reg) => {
      if (reg.pattern === event) return true;

      if (
        this.wildcard &&
        typeof reg.pattern === "string" &&
        typeof event === "string"
      ) {
        return matchWildcard(reg.pattern, event, this.delimiter);
      }

      return false;
    });
  }

  private removeRegistrations(regs: HandlerRegistration[]): void {
    if (regs.length === 0) return;
    for (const reg of regs) {
      const idx = this.handlers.indexOf(reg);
      if (idx !== -1) this.handlers.splice(idx, 1);
    }
  }
}
