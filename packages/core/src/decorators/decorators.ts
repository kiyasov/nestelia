import "reflect-metadata";

/**
 * Type definitions for decorator functions
 */
export type ClassDecorator = <T extends { new (...args: any[]): any }>(
  constructor: T,
) => T | void;
export type PropertyDecorator = (
  target: object,
  propertyKey: string | symbol,
) => void;
export type MethodDecorator = <T>(
  target: object,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void;
export type ParameterDecorator = (
  target: object,
  propertyKey: string | symbol | undefined,
  parameterIndex: number,
) => void;

/**
 * Creates a class decorator
 * @param metadataKey The key to store the metadata under
 * @param metadataValue The value to store as metadata
 * @returns A class decorator function
 */
export function classDecorator<T>(metadataKey: string, defaultValue?: any) {
  return (metadataValue?: T): ClassDecorator =>
    (target) => {
      const value = metadataValue ?? defaultValue;
      if (value !== undefined) {
        Reflect.defineMetadata(metadataKey, value, target);
      }
      return target;
    };
}

/**
 * Creates a method decorator
 * @param metadataKey The key to store the metadata under
 * @param defaultValue Optional default value if no metadata value is provided
 * @returns A method decorator factory function
 */
export function methodDecorator<T>(metadataKey: string, defaultValue?: any) {
  return (metadataValue?: T): MethodDecorator =>
    (target, propertyKey, descriptor) => {
      const value = metadataValue ?? defaultValue;
      if (value !== undefined) {
        Reflect.defineMetadata(metadataKey, value, target, propertyKey);
      }
      return descriptor;
    };
}

/**
 * Creates a property decorator
 * @param metadataKey The key to store the metadata under
 * @param defaultValue Optional default value if no metadata value is provided
 * @returns A property decorator factory function
 */
export function propertyDecorator<T>(metadataKey: string, defaultValue?: any) {
  return (metadataValue?: T): PropertyDecorator =>
    (target, propertyKey) => {
      const value = metadataValue ?? defaultValue;
      if (value !== undefined) {
        Reflect.defineMetadata(metadataKey, value, target, propertyKey);
      }
    };
}

/**
 * Creates a parameter decorator
 * @param metadataKey The key to store the metadata under
 * @param defaultValue Optional default value if no metadata value is provided
 * @returns A parameter decorator factory function
 */
export function parameterDecorator<T>(metadataKey: string, defaultValue?: any) {
  return (metadataValue?: T): ParameterDecorator =>
    (target, propertyKey, parameterIndex) => {
      const value = metadataValue ?? defaultValue;

      if (propertyKey === undefined) {
        // Constructor parameter
        const existingParams = Reflect.getMetadata(metadataKey, target) || [];
        existingParams[parameterIndex] = value;
        Reflect.defineMetadata(metadataKey, existingParams, target);
      } else {
        // Method parameter
        const existingParams =
          Reflect.getMetadata(metadataKey, target, propertyKey) || [];
        existingParams[parameterIndex] = value;
        Reflect.defineMetadata(
          metadataKey,
          existingParams,
          target,
          propertyKey,
        );
      }
    };
}

/**
 * Creates a collection decorator that adds values to an array stored in metadata
 * @param metadataKey The key to store the metadata collection under
 * @returns A decorator function that adds to the collection
 */
export function collectionDecorator<T>(metadataKey: string) {
  return (value: T): PropertyDecorator =>
    (target, propertyKey) => {
      const existingCollection = Reflect.getMetadata(metadataKey, target) || [];
      existingCollection.push({ propertyKey, value });
      Reflect.defineMetadata(metadataKey, existingCollection, target);
    };
}

/**
 * Gets metadata from a class
 * @param metadataKey The key to get the metadata from
 * @param target The class to get the metadata from
 * @returns The metadata stored under the key, or undefined if not found
 */
export function getClassMetadata<T>(
  metadataKey: string,
  target: any,
): T | undefined {
  return Reflect.getMetadata(metadataKey, target);
}

/**
 * Gets metadata from a method or property
 * @param metadataKey The key to get the metadata from
 * @param target The class instance to get the metadata from
 * @param propertyKey The name of the method or property
 * @returns The metadata stored under the key, or undefined if not found
 */
export function getPropertyMetadata<T>(
  metadataKey: string,
  target: any,
  propertyKey: string | symbol,
): T | undefined {
  return Reflect.getMetadata(metadataKey, target, propertyKey);
}

/**
 * Gets all properties of a class with a specific decorator
 * @param metadataKey The key used by the decorator to store metadata
 * @param target The class to get the decorated properties from
 * @returns An array of decorated properties and their metadata
 */
export function getDecoratedProperties<T>(
  metadataKey: string,
  target: any,
): Array<{ propertyKey: string | symbol; metadata: T }> {
  const properties: Array<{ propertyKey: string | symbol; metadata: T }> = [];

  // Get instance properties (from prototype)
  for (const propertyKey of Object.getOwnPropertyNames(target.prototype)) {
    if (Reflect.hasMetadata(metadataKey, target.prototype, propertyKey)) {
      properties.push({
        propertyKey,
        metadata: Reflect.getMetadata(
          metadataKey,
          target.prototype,
          propertyKey,
        ),
      });
    }
  }

  // Get static properties (directly on constructor)
  for (const propertyKey of Object.getOwnPropertyNames(target)) {
    if (Reflect.hasMetadata(metadataKey, target, propertyKey)) {
      properties.push({
        propertyKey,
        metadata: Reflect.getMetadata(metadataKey, target, propertyKey),
      });
    }
  }

  return properties;
}

/**
 * Combines multiple decorators into one
 * @param decorators The decorators to combine
 * @returns A new decorator that applies all the provided decorators
 */
export function composeDecorators(
  ...decorators: Array<ClassDecorator | MethodDecorator | PropertyDecorator>
) {
  return (
    target: any,
    propertyKey?: string | symbol,
    descriptorOrIndex?: TypedPropertyDescriptor<any> | number,
  ) => {
    // Apply decorators in reverse order (to match standard decorator behavior)
    for (let i = decorators.length - 1; i >= 0; i--) {
      const decorator = decorators[i];
      if (typeof propertyKey === "undefined") {
        // Class decorator
        (decorator as ClassDecorator)(target);
      } else if (typeof descriptorOrIndex === "undefined") {
        // Property decorator
        (decorator as PropertyDecorator)(target, propertyKey);
      } else if (typeof descriptorOrIndex === "number") {
        // Parameter decorator
        (decorator as ParameterDecorator)(
          target,
          propertyKey,
          descriptorOrIndex,
        );
      } else {
        // Method decorator
        (decorator as MethodDecorator)(target, propertyKey, descriptorOrIndex);
      }
    }
  };
}

/**
 * Creates a decorator that extends a class with additional properties or methods
 * @param mixin The mixin object containing properties and methods to add
 * @returns A class decorator that extends the target class
 */
export function mixinDecorator(mixin: Record<string, any>): ClassDecorator {
  return (target) => {
    for (const property of Object.getOwnPropertyNames(mixin)) {
      if (property !== "constructor") {
        Object.defineProperty(
          target.prototype,
          property,
          Object.getOwnPropertyDescriptor(mixin, property) ||
            Object.create(null),
        );
      }
    }
  };
}

/**
 * Creates a factory function that can be used with dependency injection
 * @param factory Factory function that creates the instance
 * @returns A class decorator that associates the factory with the class
 */
export function factory<T>(factory: (...args: any[]) => T) {
  return classDecorator<(...args: any[]) => T>("factory", factory);
}

/**
 * Checks if a class has a specific decorator
 * @param metadataKey The key used by the decorator to store metadata
 * @param target The class to check
 * @returns True if the class has the decorator, false otherwise
 */
export function hasDecorator(metadataKey: string, target: any): boolean {
  return Reflect.hasMetadata(metadataKey, target);
}

/**
 * Checks if a property or method has a specific decorator
 * @param metadataKey The key used by the decorator to store metadata
 * @param target The class instance to check
 * @param propertyKey The name of the property or method
 * @returns True if the property or method has the decorator, false otherwise
 */
export function hasPropertyDecorator(
  metadataKey: string,
  target: any,
  propertyKey: string | symbol,
): boolean {
  return Reflect.hasMetadata(metadataKey, target, propertyKey);
}
