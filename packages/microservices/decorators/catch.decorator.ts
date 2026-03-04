import "reflect-metadata";

import { CATCH_EXCEPTIONS_METADATA } from "../constants";

/**
 * Marks an exception filter class and declares which exception types it handles.
 * Omitting arguments causes the filter to catch **all** exceptions.
 *
 * @param exceptions - Exception constructors this filter should handle.
 *
 * @example
 * ```typescript
 * @Catch(HttpException, ValidationException)
 * class MyFilter implements ExceptionFilter {
 *   catch(exception: Error, context: ExceptionContext) { ... }
 * }
 * ```
 */
export function Catch(
  ...exceptions: Array<new (...args: unknown[]) => Error>
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CATCH_EXCEPTIONS_METADATA, exceptions, target);
  };
}
