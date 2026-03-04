import "reflect-metadata";

import { getEventEmitter } from "./event-emitter.container";

// Constants for metadata keys
export const EVENT_LISTENER_METADATA = "custom:event_listener";
export const EVENTS_METADATA = "custom:events";

/**
 * Decorator to mark a class as an event subscriber
 */
export function EventSubscriber(): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(EVENT_LISTENER_METADATA, true, target);
  };
}

/**
 * Options for the OnEvent decorator
 */
export interface OnEventOptions {
  /**
   * Whether the handler should only be called once
   */
  once?: boolean;
}

/**
 * Decorator to mark a method as an event handler
 */
export function OnEvent(
  event: string | symbol,
  options: OnEventOptions = {},
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    // Get existing event handlers or create new array
    const events =
      Reflect.getMetadata(EVENTS_METADATA, target.constructor) || [];

    // Add this event handler
    events.push({
      event,
      methodName: propertyKey,
      once: options.once || false,
    });

    // Update metadata
    Reflect.defineMetadata(EVENTS_METADATA, events, target.constructor);

    return descriptor;
  };
}

/**
 * Function to register event handlers from a class instance
 */
export function registerEventHandlers(instance: any): void {
  const constructor = instance.constructor;
  const isSubscriber = Reflect.getMetadata(
    EVENT_LISTENER_METADATA,
    constructor,
  );

  if (!isSubscriber) {
    return; // Not an event subscriber
  }

  const eventHandlers = Reflect.getMetadata(EVENTS_METADATA, constructor) || [];
  const eventEmitter = getEventEmitter();

  // Register each event handler
  for (const { event, methodName, once } of eventHandlers) {
    const handler = instance[methodName].bind(instance);

    if (once) {
      eventEmitter.once(event, handler);
    } else {
      eventEmitter.on(event, handler);
    }
  }
}
