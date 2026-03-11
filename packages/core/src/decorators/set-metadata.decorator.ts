import "reflect-metadata";

/**
 * Decorator that assigns metadata to the class using the specified key.
 *
 * This metadata can be reflected using the `Reflect` API.
 *
 * @param metadataKey The key used to store the metadata.
 * @param metadataValue The value to store.
 *
 */
export function SetMetadata<K = string, V = any>(
  metadataKey: K,
  metadataValue: V,
): MethodDecorator & ClassDecorator {
  return <T>(
    target: object | (new (...args: unknown[]) => unknown),
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<T>,
  ) => {
    if (propertyKey !== undefined && descriptor !== undefined) {
      // Method decorator
      Reflect.defineMetadata(
        metadataKey,
        metadataValue,
        target.constructor,
        propertyKey,
      );
    } else {
      // Class decorator
      Reflect.defineMetadata(metadataKey, metadataValue, target);
    }
  };
}
