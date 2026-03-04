import "reflect-metadata";

import { CONTEXT_METADATA } from "./constants";

/** Context metadata stored in Reflect. */
export interface ContextMetadata {
  /** Parameter index in the method signature. */
  index: number;
  /** Property name to extract from context (optional). */
  property?: string;
}

/**
 * Decorator for the GraphQL context.
 * Provides access to the GraphQL request context.
 *
 * @param property - Optional property name to extract from context.
 *
 * @example
 * ```typescript
 * @Query()
 * async me(@Context() ctx: MyContext) {
 *   return ctx.currentUser;
 * }
 *
 * @Query()
 * async users(@Context() ctx: GraphQLContext) {
 *   return this.userService.findAll(ctx.tenantId);
 * }
 *
 * @Mutation()
 * async createPost(
 *   @Args('input') input: CreatePostInput,
 *   @Context() ctx: MyContext
 * ) {
 *   return this.postService.create(input, ctx.userId);
 * }
 * ```
 */
export function Context(property?: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingParams: ContextMetadata[] =
      Reflect.getMetadata(CONTEXT_METADATA, target, propertyKey as string) ||
      [];

    existingParams.push({
      index: parameterIndex,
      property,
    });

    Reflect.defineMetadata(
      CONTEXT_METADATA,
      existingParams,
      target,
      propertyKey as string,
    );
  };
}

/** Alias for @Context decorator. */
export const Ctx = Context;
