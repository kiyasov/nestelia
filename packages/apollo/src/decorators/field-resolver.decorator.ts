import "reflect-metadata";

import { typeMetadataStorage } from "../storages/type-metadata.storage";
import { getOperationArgsDefinitions } from "./args.decorator";
import { FIELD_RESOLVER_METADATA, RETURN_TYPE_METADATA } from "./constants";
import type { Constructor } from "./types";

/** Options for the @FieldResolver decorator. */
export interface FieldResolverOptions {
  /** Field name (defaults to method name). */
  name?: string;
  /** Description for documentation. */
  description?: string;
  /** Whether the field can return null. */
  nullable?: boolean;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Function returning the field type. */
  returnType?: () => unknown | Constructor | string;
  /** Additional extensions. */
  extensions?: Record<string, unknown>;
}

/** FieldResolver metadata stored in Reflect. */
export interface FieldResolverMetadata {
  kind: "field";
  methodName: string | symbol;
  name: string | symbol;
  description?: string;
  nullable?: boolean;
  deprecationReason?: string;
  returnType?: () => unknown;
  extensions?: Record<string, unknown>;
}

/**
 * Decorator for a field resolver.
 * Used to resolve individual fields of a type.
 *
 * @param typeFn - Return type factory, options object, or field name.
 * @param options - Field resolver options when typeFn is a function.
 *
 * @example
 * ```typescript
 * @Resolver('User')
 * class UserResolver {
 *   @FieldResolver()
 *   async posts(@Parent() user: User) {
 *     return this.postService.findByUserId(user.id);
 *   }
 *
 *   @FieldResolver(() => [Post])
 *   async posts(@Parent() user: User) {
 *     return this.postService.findByUserId(user.id);
 *   }
 *
 *   @FieldResolver('fullName')
 *   async getFullName(@Parent() user: User) {
 *     return `${user.firstName} ${user.lastName}`;
 *   }
 *
 *   @FieldResolver({ name: 'avatar', nullable: true, description: 'User avatar URL' })
 *   async getAvatar(@Parent() user: User) {
 *     return user.avatarUrl;
 *   }
 * }
 * ```
 */
export function FieldResolver(
  typeFn?: (() => unknown) | FieldResolverOptions | string,
  options?: FieldResolverOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    let opts: FieldResolverOptions;
    let returnType: (() => unknown) | undefined;

    if (typeof typeFn === "function") {
      returnType = typeFn;
      opts = options || {};
    } else if (typeof typeFn === "string") {
      opts = { name: typeFn };
    } else {
      opts = typeFn || {};
    }

    const metadata: FieldResolverMetadata = {
      kind: "field",
      methodName: propertyKey,
      name: opts.name || propertyKey,
      description: opts.description,
      nullable: opts.nullable,
      deprecationReason: opts.deprecationReason,
      returnType: returnType || opts.returnType,
      extensions: opts.extensions,
    };

    Reflect.defineMetadata(
      FIELD_RESOLVER_METADATA,
      metadata,
      target,
      propertyKey,
    );

    const returnTypeMetadata = Reflect.getMetadata(
      RETURN_TYPE_METADATA,
      target,
      propertyKey,
    ) as
      | {
          typeFn?: () => unknown;
          nullable?: boolean;
          description?: string;
          deprecationReason?: string;
        }
      | undefined;

    typeMetadataStorage.addFieldResolver({
      kind: "fieldResolver",
      target,
      methodName: propertyKey.toString(),
      name: (opts.name || propertyKey).toString(),
      returnType: returnType || opts.returnType || returnTypeMetadata?.typeFn,
      nullable: opts.nullable ?? returnTypeMetadata?.nullable,
      description: opts.description ?? returnTypeMetadata?.description,
      deprecationReason:
        opts.deprecationReason ?? returnTypeMetadata?.deprecationReason,
      args: getOperationArgsDefinitions(target, propertyKey.toString()),
    });
  };
}

/**
 * Decorator to explicitly specify the return type of a field resolver.
 * @param typeFn - Function returning the type.
 * @param options - Additional options.
 *
 * @example
 * ```typescript
 * @Resolver('User')
 * class UserResolver {
 *   @FieldResolver()
 *   @ResolverReturnType(() => [Post])
 *   async posts(@Parent() user: User) {
 *     return this.postService.findByUserId(user.id);
 *   }
 * }
 * ```
 */
export function ResolverReturnType(
  typeFn: () => unknown,
  options?: {
    nullable?: boolean;
    description?: string;
    deprecationReason?: string;
  },
): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      RETURN_TYPE_METADATA,
      { typeFn, ...options },
      target,
      propertyKey,
    );
  };
}
