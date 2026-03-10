import "reflect-metadata";

import { ON_EVENT_METADATA } from "../event-emitter.constants";
import type { OnEventMetadata } from "../interfaces";

/**
 * Options for `@OnEvent`.
 *
 * @publicApi
 */
export interface OnEventOptions {
  /**
   * When `true`, the handler is automatically unregistered after the first
   * invocation.
   *
   * @default false
   */
  once?: boolean;
}

/**
 * Marks a method as a listener for the given event (or wildcard pattern).
 *
 * The method is automatically registered during `onApplicationBootstrap` by
 * `EventEmitterExplorer` — no extra wiring is required.
 *
 * @param event - Event name, wildcard pattern (`"order.*"`, `"**"`), or symbol.
 * @param options - Optional configuration.
 *
 * @example
 * ```typescript
 * @Injectable()
 * export class NotificationListener {
 *   @OnEvent('order.created')
 *   handleOrderCreated(order: Order) {
 *     console.log('New order:', order.id);
 *   }
 *
 *   @OnEvent('order.*')
 *   handleAnyOrderEvent(payload: unknown) {
 *     console.log('Order event fired');
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export function OnEvent(
  event: string | symbol,
  options: OnEventOptions = {},
): MethodDecorator {
  return (
    target: object,
    propertyKey: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    const existing: OnEventMetadata[] =
      Reflect.getMetadata(ON_EVENT_METADATA, target.constructor) ?? [];

    existing.push({
      event,
      methodName: propertyKey,
      once: options.once ?? false,
    });

    Reflect.defineMetadata(ON_EVENT_METADATA, existing, target.constructor);
    return descriptor;
  };
}
