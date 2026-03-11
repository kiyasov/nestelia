import "reflect-metadata";

/**
 * Type for constructor functions (classes)
 */
type Constructor = abstract new (...args: unknown[]) => unknown;

/**
 * Helper class for retrieving metadata from classes and methods using reflect-metadata.
 *
 */
export class Reflector {
  /**
   * Retrieve metadata for a specified key from a target object.
   *
   * @param metadataKey the metadata key
   * @param target the target object
   * @returns the metadata value
   *
   */
  get<T = unknown>(
    metadataKey: string | symbol,
    target: object | Constructor,
  ): T | undefined;

  /**
   * Retrieve metadata for a specified key from a target object's method.
   *
   * @param metadataKey the metadata key
   * @param target the target object
   * @param propertyKey the property key (method name)
   * @returns the metadata value
   *
   */
  get<T = unknown>(
    metadataKey: string | symbol,
    target: object | Constructor,
    propertyKey: string | symbol,
  ): T | undefined;

  get<T = unknown>(
    metadataKey: string | symbol,
    target: object | Constructor,
    propertyKey?: string | symbol,
  ): T | undefined {
    if (propertyKey !== undefined) {
      return Reflect.getMetadata(metadataKey, target, propertyKey);
    }
    return Reflect.getMetadata(metadataKey, target);
  }

  /**
   * Retrieve all metadata keys from a target object.
   *
   * @param target the target object
   * @returns array of metadata keys
   *
   */
  getMetadataKeys(target: object | Constructor): (string | symbol)[];

  /**
   * Retrieve all metadata keys from a target object's method.
   *
   * @param target the target object
   * @param propertyKey the property key (method name)
   * @returns array of metadata keys
   *
   */
  getMetadataKeys(
    target: object | Constructor,
    propertyKey: string | symbol,
  ): (string | symbol)[];

  getMetadataKeys(
    target: object | Constructor,
    propertyKey?: string | symbol,
  ): (string | symbol)[] {
    if (propertyKey !== undefined) {
      return Reflect.getMetadataKeys(target, propertyKey);
    }
    return Reflect.getMetadataKeys(target);
  }

  /**
   * Retrieve metadata for a specified key from multiple targets and return the first defined value.
   * This method is useful when you want to get metadata from both class and method, where method
   * metadata should override class metadata.
   *
   * @param metadataKey the metadata key
   * @param targets array of target objects to check
   * @returns the first defined metadata value
   *
   */
  getAllAndOverride<T = unknown>(
    metadataKey: string | symbol,
    targets: (object | Constructor)[],
  ): T | undefined {
    for (const target of targets) {
      const result = Reflect.getMetadata(metadataKey, target);
      if (result !== undefined) {
        return result;
      }
    }
    return undefined;
  }

  /**
   * Retrieve metadata for a specified key from multiple targets and merge the results.
   * Arrays will be concatenated, objects will be merged, and primitive values will be
   * collected into an array.
   *
   * @param metadataKey the metadata key
   * @param targets array of target objects to check
   * @returns merged metadata value
   *
   */
  getAllAndMerge<T = unknown>(
    metadataKey: string | symbol,
    targets: (object | Constructor)[],
  ): T | undefined {
    const results = targets
      .map((target) => Reflect.getMetadata(metadataKey, target))
      .filter((result) => result !== undefined);

    if (results.length === 0) {
      return undefined;
    }

    if (results.every((result) => Array.isArray(result))) {
      return results.flat() as T;
    }

    if (
      results.every((result) => typeof result === "object" && result !== null)
    ) {
      return Object.assign({}, ...results) as T;
    }

    return results as T;
  }
}
