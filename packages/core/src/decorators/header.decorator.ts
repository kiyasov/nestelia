import "reflect-metadata";

export const HEADERS_METADATA = "__headers__";

/**
 * Decorator that sets HTTP headers for the response.
 *
 * @param name The header name
 * @param value The header value
 *
 * @example
 * ```typescript
 * @Get()
 * @Header('Cache-Control', 'none')
 * getData() {
 *   return { data: [] };
 * }
 *
 * @Post()
 * @Header('Location', '/resource/123')
 * create() {
 *   return { id: 123 };
 * }
 * ```
 *
 * @publicApi
 */
export function Header(name: string, value: string): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ) => {
    const existingHeaders =
      Reflect.getMetadata(HEADERS_METADATA, target.constructor, propertyKey) ||
      [];

    Reflect.defineMetadata(
      HEADERS_METADATA,
      [...existingHeaders, { name, value }],
      target.constructor,
      propertyKey,
    );
  };
}
