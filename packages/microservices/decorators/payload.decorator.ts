import "reflect-metadata";

import { MESSAGE_DATA_METADATA } from "../constants";

/**
 * Extracts the message payload (or a nested property of it) and injects it
 * as a method parameter.
 *
 * @param property - When provided, only the named property of the payload is injected.
 *
 * @example
 * ```typescript
 * // Inject the full payload
 * @MessagePattern('sum')
 * sum(@Payload() data: number[]) { ... }
 *
 * // Inject a specific property
 * @MessagePattern('login')
 * login(@Payload('username') username: string) { ... }
 * ```
 */
export function Payload(property?: string): ParameterDecorator {
  return (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number,
  ) => {
    const existing: Array<{ index: number; property?: string }> =
      Reflect.getMetadata(
        MESSAGE_DATA_METADATA,
        target,
        propertyKey as string,
      ) ?? [];

    existing.push({ index: parameterIndex, property });

    Reflect.defineMetadata(
      MESSAGE_DATA_METADATA,
      existing,
      target,
      propertyKey as string,
    );
  };
}
