import "reflect-metadata";

import { typeMetadataStorage } from "../storages/type-metadata.storage";
import { getOperationArgsDefinitions } from "./args.decorator";
import { MUTATION_METADATA } from "./constants";

/** Options for the @Mutation decorator. */
export interface MutationOptions {
  /** Mutation name (defaults to method name). */
  name?: string;
  /** Description for documentation. */
  description?: string;
  /** Whether the mutation can return null. */
  nullable?: boolean;
  /** Default value for the mutation result. */
  defaultValue?: unknown;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Additional extensions. */
  extensions?: Record<string, unknown>;
  /** Return type factory function. */
  returnType?: () => unknown;
}

/** Mutation metadata stored in Reflect. */
export interface MutationMetadata {
  kind: "mutation";
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
 * Decorator for a GraphQL Mutation.
 * @param typeFn - Return type factory, options object, or mutation name.
 * @param options - Mutation options when typeFn is a function.
 *
 * @example
 * ```typescript
 * @Mutation()
 * async createUser(@Args('input') input: CreateUserInput): Promise<User> {
 *   return this.userService.create(input);
 * }
 *
 * @Mutation(() => User)
 * async create(@Args('input') input: CreateUserInput): Promise<User> {
 *   return this.userService.create(input);
 * }
 *
 * @Mutation('updateUser')
 * async update(@Args('id') id: string, @Args('input') input: UpdateUserInput): Promise<User> {
 *   return this.userService.update(id, input);
 * }
 *
 * @Mutation({ name: 'deleteUser', description: 'Delete user by id' })
 * async remove(@Args('id') id: string): Promise<boolean> {
 *   return this.userService.delete(id);
 * }
 * ```
 */
export function Mutation(
  typeFn?: (() => unknown) | MutationOptions | string,
  options?: MutationOptions,
): MethodDecorator {
  return (target, propertyKey) => {
    let opts: MutationOptions;
    let returnType: (() => unknown) | undefined;

    if (typeof typeFn === "function") {
      returnType = typeFn;
      opts = options || {};
    } else if (typeof typeFn === "string") {
      opts = { name: typeFn };
    } else {
      opts = typeFn || {};
    }

    const metadata: MutationMetadata = {
      kind: "mutation",
      methodName: propertyKey,
      name: opts.name || propertyKey,
      description: opts.description,
      nullable: opts.nullable,
      defaultValue: opts.defaultValue,
      deprecationReason: opts.deprecationReason,
      extensions: opts.extensions,
      returnType: returnType || opts.returnType,
    };

    Reflect.defineMetadata(MUTATION_METADATA, metadata, target, propertyKey);

    typeMetadataStorage.addMutation({
      kind: "mutation",
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
