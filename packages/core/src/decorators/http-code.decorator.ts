import "reflect-metadata";

export const HTTP_CODE_METADATA = "__httpCode__";

/**
 * Decorator that sets the HTTP status code for the response.
 *
 * @param statusCode The HTTP status code to return.
 *
 * @example
 * ```typescript
 * @Post()
 * @HttpCode(201)
 * create() {
 *   return 'Created successfully';
 * }
 *
 * @Get('not-found')
 * @HttpCode(404)
 * notFound() {
 *   return 'Resource not found';
 * }
 * ```
 *
 * @publicApi
 */
export function HttpCode(statusCode: number): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    Reflect.defineMetadata(
      HTTP_CODE_METADATA,
      statusCode,
      target.constructor,
      propertyKey,
    );
  };
}
