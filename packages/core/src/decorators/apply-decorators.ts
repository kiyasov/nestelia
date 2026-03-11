/**
 * Applies multiple decorators to a target (class, method, or property).
 * Useful for composing multiple decorators into a single one.
 *
 * @param decorators Array of decorators to apply.
 *
 */
export function applyDecorators(
  ...decorators: (
    | ClassDecorator
    | MethodDecorator
    | PropertyDecorator
    | ParameterDecorator
  )[]
): (
  target: object,
  propertyKey?: string | symbol,
  descriptor?: TypedPropertyDescriptor<unknown> | number,
) => void {
  return (
    target: object,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<unknown> | number,
  ): void => {
    for (const decorator of decorators) {
      if (typeof descriptor === "number") {
        // Parameter decorator
        (decorator as ParameterDecorator)(
          target,
          propertyKey as string | symbol,
          descriptor,
        );
      } else if (target instanceof Function && propertyKey === undefined) {
        // Class decorator
        (decorator as ClassDecorator)(
          target as new (...args: unknown[]) => unknown,
        );
      } else if (propertyKey !== undefined && descriptor !== undefined) {
        // Method decorator
        (decorator as MethodDecorator)(target, propertyKey, descriptor);
      } else if (propertyKey !== undefined) {
        // Property decorator
        (decorator as PropertyDecorator)(target, propertyKey);
      }
    }
  };
}
