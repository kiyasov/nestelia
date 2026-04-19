import { Logger } from "../logger/logger.service";
import type {
  EventHandler,
  EventHandlerRegistration,
  IEventEmitter,
} from "./event-emitter.interface";

/**
 * Event emitter for dispatching and handling events
 */
export class EventEmitter implements IEventEmitter {
  /**
   * Map of event names to handlers
   */
  private readonly handlers: Map<string | symbol, EventHandlerRegistration[]> =
    new Map();

  /**
   * Register an event handler
   */
  on<T = any>(event: string | symbol, handler: EventHandler<T>): void {
    this.registerHandler(event, handler, false);
  }

  /**
   * Register a one-time event handler
   */
  once<T = any>(event: string | symbol, handler: EventHandler<T>): void {
    this.registerHandler(event, handler, true);
  }

  /**
   * Remove an event handler
   */
  off<T = any>(event: string | symbol, handler?: EventHandler<T>): void {
    if (!this.handlers.has(event)) {
      return;
    }

    if (!handler) {
      // Remove all handlers for this event
      this.handlers.delete(event);
      return;
    }

    // Remove specific handler
    const handlers = this.handlers.get(event);
    if (handlers) {
      const filteredHandlers = handlers.filter(
        (reg) => reg.handler !== handler,
      );

      if (filteredHandlers.length === 0) {
        this.handlers.delete(event);
      } else {
        this.handlers.set(event, filteredHandlers);
      }
    }
  }

  /**
   * Emit an event with a payload
   */
  async emit<T = any>(event: string | symbol, payload: T): Promise<void> {
    if (!this.handlers.has(event)) {
      return;
    }

    const handlers = this.handlers.get(event) || [];
    const oneTimeHandlers: EventHandlerRegistration[] = [];

    // Execute all handlers
    const promises = handlers.map(async (registration) => {
      try {
        await registration.handler(payload);

        // Track one-time handlers to remove after execution
        if (registration.once) {
          oneTimeHandlers.push(registration);
        }
      } catch (error) {
        Logger.error(
          `Error in event handler for event "${String(event)}": ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
          "EventEmitter",
        );
      }
    });

    await Promise.all(promises);

    // Remove one-time handlers
    if (oneTimeHandlers.length > 0) {
      const remainingHandlers = handlers.filter(
        (reg) => !oneTimeHandlers.includes(reg),
      );

      if (remainingHandlers.length === 0) {
        this.handlers.delete(event);
      } else {
        this.handlers.set(event, remainingHandlers);
      }
    }
  }

  /**
   * Remove all listeners, or all listeners for a specific event
   */
  removeAllListeners(event?: string | symbol): void {
    if (event !== undefined) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }

  /**
   * Register a handler with metadata
   */
  private registerHandler<T = any>(
    event: string | symbol,
    handler: EventHandler<T>,
    once: boolean,
  ): void {
    const registration: EventHandlerRegistration = { handler, once };

    if (!this.handlers.has(event)) {
      this.handlers.set(event, [registration]);
    } else {
      const handlers = this.handlers.get(event);
      handlers?.push(registration);
    }
  }
}
