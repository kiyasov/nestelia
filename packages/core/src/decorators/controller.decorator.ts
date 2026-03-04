import "reflect-metadata";

import { ROUTE_PREFIX_METADATA } from "../decorators/constants";

/**
 * Controller decorator that defines a controller with a route prefix.
 *
 * @param prefix The route prefix for all controller routes
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UsersController {
 *   @Get()
 *   findAll() {
 *     return [];
 *   }
 * }
 * ```
 */
export function Controller(prefix = ""): ClassDecorator {
  return function (constructor: Function) {
    Reflect.defineMetadata(ROUTE_PREFIX_METADATA, prefix, constructor);
  };
}
