import "reflect-metadata";

import { MESSAGE_PATTERN_METADATA } from "../constants";
import type { Transport } from "../enums/transport.enum";
import type { MessagePatternMetadata } from "../interfaces";

/**
 * Marks a controller method as a **request-response** message handler.
 * The method is called when a client sends a message matching `pattern`
 * and it is expected to return a response.
 *
 * @param pattern - String or object that identifies this handler.
 * @param transport - Optional transport override; defaults to the server's transport.
 *
 * @example
 * ```typescript
 * @MessagePattern('sum')
 * accumulate(@Payload() data: number[]): number {
 *   return data.reduce((a, b) => a + b, 0);
 * }
 * ```
 */
export function MessagePattern(
  pattern: string | Record<string, unknown>,
  transport?: Transport | symbol,
): MethodDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const metadata: MessagePatternMetadata = { pattern, transport };
    Reflect.defineMetadata(
      MESSAGE_PATTERN_METADATA,
      metadata,
      target,
      propertyKey,
    );
  };
}
