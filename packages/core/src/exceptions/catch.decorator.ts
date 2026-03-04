import "reflect-metadata";

/**
 * Metadata key for storing caught exception types
 */
export const CATCH_EXCEPTIONS_METADATA = "__catchExceptions__";

/**
 * Metadata key for marking a class as an exception filter
 */
export const CATCH_WATERMARK = "__catchWatermark__";

/**
 * Decorator that marks a class as an exception filter.
 * The decorated class must implement the `ExceptionFilter` interface.
 *
 * @param exceptions one or more exception types specifying
 * the exceptions to be caught and handled by this filter.
 *
 * @example
 * ```typescript
 * @Catch(HttpException)
 * export class HttpExceptionFilter implements ExceptionFilter {
 *   catch(exception: HttpException, context: ExceptionContext) {
 *     return {
 *       statusCode: exception.getStatus(),
 *       message: exception.message,
 *     };
 *   }
 * }
 * ```
 */
export function Catch(
  ...exceptions: Array<new (...args: unknown[]) => Error>
): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(CATCH_WATERMARK, true, target);
    Reflect.defineMetadata(CATCH_EXCEPTIONS_METADATA, exceptions, target);
    return target;
  };
}

/**
 * Get the exception types that a filter catches
 */
export function getCatchExceptionsMetadata(
  target: object,
): Array<new (...args: unknown[]) => Error> | undefined {
  return Reflect.getMetadata(CATCH_EXCEPTIONS_METADATA, target);
}

/**
 * Check if a class is marked as an exception filter
 */
export function isCatchFilter(target: object): boolean {
  return Reflect.getMetadata(CATCH_WATERMARK, target) === true;
}
