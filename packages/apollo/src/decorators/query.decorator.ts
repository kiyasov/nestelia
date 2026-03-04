import "reflect-metadata";

import { typeMetadataStorage } from "../storages/type-metadata.storage";
import { getOperationArgsDefinitions } from "./args.decorator";
import { QUERY_METADATA, RETURN_TYPE_METADATA } from "./constants";

/** Options for the @Query decorator. */
export interface QueryOptions {
  /** Query name (defaults to method name). */
  name?: string;
  /** Description for documentation. */
  description?: string;
  /** Whether the query can return null. */
  nullable?: boolean;
  /** Default value for the query result. */
  defaultValue?: unknown;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Additional extensions. */
  extensions?: Record<string, unknown>;
  /** Return type factory function. */
  returnType?: () => unknown;
}

/** Query metadata stored in Reflect. */
export interface QueryMetadata {
  kind: "query";
  methodName: string | symbol;
  name: string | symbol;
  description?: string;
  nullable?: boolean;
  defaultValue?: unknown;
  deprecationReason?: string;
  extensions?: Record<string, unknown>;
  returnType?: () => unknown;
}

/**
 * Decorator for a GraphQL Query.
 * @param typeFn - Return type factory, options object, or query name.
 * @param options - Query options when typeFn is a function.
 *
 * @example
 * ```typescript
 * @Query()
 * async users(): Promise<User[]> {
 *   return this.userService.findAll();
 * }
 *
 * @Query('user')
 * async findUser(@Args('id') id: string): Promise<User> {
 *   return this.userService.findById(id);
 * }
 *
 * @Query({ name: 'user', description: 'Find user by id', nullable: true })
 * async findUser(@Args('id') id: string): Promise<User | null> {
 *   return this.userService.findById(id);
 * }
 * ```
 */
export function Query(
  typeFn?: (() => unknown) | QueryOptions | string,
  options?: QueryOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    let opts: QueryOptions;
    let returnType: (() => unknown) | undefined;

    if (typeof typeFn === "function") {
      returnType = typeFn;
      opts = options || {};
    } else if (typeof typeFn === "string") {
      opts = { name: typeFn };
    } else {
      opts = typeFn || {};
    }

    const metadata: QueryMetadata = {
      kind: "query",
      methodName: propertyKey,
      name: opts.name || propertyKey,
      description: opts.description,
      nullable: opts.nullable,
      defaultValue: opts.defaultValue,
      deprecationReason: opts.deprecationReason,
      extensions: opts.extensions,
      returnType: returnType || opts.returnType,
    };

    Reflect.defineMetadata(QUERY_METADATA, metadata, target, propertyKey);

    typeMetadataStorage.addQuery({
      kind: "query",
      target,
      methodName: propertyKey as string,
      name: opts.name || propertyKey.toString(),
      returnType: returnType || opts.returnType,
      nullable: opts.nullable,
      defaultValue: opts.defaultValue,
      description: opts.description,
      deprecationReason: opts.deprecationReason,
      args: getOperationArgsDefinitions(target, propertyKey as string),
    });
  };
}

/**
 * Decorator to explicitly specify the return type of a Query.
 * @param typeFn - Function returning the type.
 * @param options - Additional options.
 *
 * @example
 * ```typescript
 * @Query()
 * @ReturnType(() => User)
 * async user() { }
 *
 * @Query()
 * @ReturnType(() => [User])
 * async users() { }
 *
 * @Query()
 * @ReturnType(() => User, { nullable: true })
 * async userOptional() { }
 * ```
 */
export function ReturnType(
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
