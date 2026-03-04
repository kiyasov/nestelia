import "reflect-metadata";

import { RESOLVER_METADATA } from "./constants";
import type { Constructor } from "./types";

/** Options for the @Resolver decorator. */
export interface ResolverOptions {
  /** GraphQL type name in schema. */
  name?: string;
  /** Description for documentation. */
  description?: string;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Additional extensions. */
  extensions?: Record<string, unknown>;
  /** Function returning the type (for lazy loading). */
  type?: () => Constructor;
}

/**
 * Decorator for a GraphQL resolver class.
 * @param options - Resolver options, type name string, or type factory function.
 *
 * @example
 * ```typescript
 * @Resolver('User')
 * class UserResolver {
 *   @Query()
 *   async user(@Args('id') id: string) {
 *     return this.userService.findById(id);
 *   }
 * }
 *
 * // or
 * @Resolver(() => User)
 * class UserResolver {
 *   // ...
 * }
 *
 * // or with options
 * @Resolver({ name: 'User', description: 'User resolver' })
 * class UserResolver {
 *   // ...
 * }
 * ```
 */
export function Resolver(
  options?: ResolverOptions | string | (() => Constructor),
): ClassDecorator {
  return (target) => {
    let resolverOptions: ResolverOptions;

    if (typeof options === "string") {
      resolverOptions = { name: options };
    } else if (typeof options === "function") {
      resolverOptions = { type: options, name: options().name };
    } else {
      resolverOptions = options || {};
    }

    Reflect.defineMetadata(RESOLVER_METADATA, resolverOptions, target);
    return target;
  };
}
