import { EventEmitter } from "./event-emitter";

/**
 * Singleton container for the event emitter
 */
class EventEmitterContainer {
  private static instance: EventEmitterContainer;
  private readonly eventEmitter: EventEmitter;

  private constructor() {
    this.eventEmitter = new EventEmitter();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): EventEmitterContainer {
    if (!EventEmitterContainer.instance) {
      EventEmitterContainer.instance = new EventEmitterContainer();
    }
    return EventEmitterContainer.instance;
  }

  /**
   * Get the event emitter
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }
}

/**
 * Get the global event emitter instance
 */
export function getEventEmitter(): EventEmitter {
  return EventEmitterContainer.getInstance().getEventEmitter();
}
