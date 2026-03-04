import "reflect-metadata";

import { MESSAGE_PATTERN_CTX_METADATA } from "../constants";

/**
 * Injects the microservice execution context into a method parameter.
 * The context contains transport information and the matched pattern.
 *
 * @example
 * ```typescript
 * @MessagePattern('greet')
 * greet(@Payload() data: unknown, @MessageCtx() ctx: Record<string, unknown>) {
 *   console.log(ctx.transport); // e.g. "redis"
 * }
 * ```
 */
export function MessageCtx(): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    const existing: Array<{ index: number }> =
      Reflect.getMetadata(
        MESSAGE_PATTERN_CTX_METADATA,
        target,
        propertyKey as string,
      ) ?? [];

    existing.push({ index: parameterIndex });

    Reflect.defineMetadata(
      MESSAGE_PATTERN_CTX_METADATA,
      existing,
      target,
      propertyKey as string,
    );
  };
}
