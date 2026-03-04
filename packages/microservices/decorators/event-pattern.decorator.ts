import "reflect-metadata";

import { EVENT_PATTERN_METADATA } from "../constants";
import type { Transport } from "../enums/transport.enum";
import type { EventPatternMetadata } from "../interfaces";

/**
 * Marks a controller method as a **fire-and-forget** event handler.
 * The method is called when a publisher emits an event matching `pattern`.
 * No response is sent back to the publisher.
 *
 * @param pattern - String or object that identifies this event.
 * @param transport - Optional transport override.
 *
 * @example
 * ```typescript
 * @EventPattern('user.created')
 * handleUserCreated(@Payload() data: CreateUserDto): void {
 *   this.usersService.create(data);
 * }
 * ```
 */
export function EventPattern(
  pattern: string | Record<string, unknown>,
  transport?: Transport | symbol,
): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const metadata: EventPatternMetadata = { pattern, transport };
    Reflect.defineMetadata(
      EVENT_PATTERN_METADATA,
      metadata,
      target,
      propertyKey,
    );
  };
}
