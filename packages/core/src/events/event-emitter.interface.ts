/**
 * Event handler function type
 */
export type EventHandler<T = any> = (payload: T) => void | Promise<void>;

/**
 * Event handler registration with metadata
 */
export interface EventHandlerRegistration<T = any> {
  handler: EventHandler<T>;
  once: boolean;
}

/**
 * Interface for event emitter
 */
export interface IEventEmitter {
  /**
   * Register a handler for an event
   */
  on<T = any>(event: string | symbol, handler: EventHandler<T>): void;

  /**
   * Register a one-time handler for an event
   */
  once<T = any>(event: string | symbol, handler: EventHandler<T>): void;

  /**
   * Remove a handler for an event
   */
  off<T = any>(event: string | symbol, handler?: EventHandler<T>): void;

  /**
   * Emit an event with a payload
   */
  emit<T = any>(event: string | symbol, payload: T): Promise<void>;
}
