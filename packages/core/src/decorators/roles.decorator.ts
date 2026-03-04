import "reflect-metadata";

// Metadata key
export const ROLES_KEY = "custom:roles";

/**
 * Set the roles that can access a route
 */
export function Roles(...roles: string[]) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor,
  ) {
    if (descriptor && propertyKey) {
      // Method decorator
      Reflect.defineMetadata(ROLES_KEY, roles, target.constructor, propertyKey);
    } else {
      // Class decorator
      Reflect.defineMetadata(ROLES_KEY, roles, target);
    }
  };
}
