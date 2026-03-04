import "reflect-metadata";

import { PARENT_METADATA } from "./constants";

/** Parent object metadata stored in Reflect. */
export interface ParentMetadata {
  /** Parameter index in the method signature. */
  index: number;
}

/**
 * Decorator for the parent/root value in a field resolver.
 * Provides access to the parent object from the field resolver.
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
 *   @FieldResolver()
 *   async fullName(@Parent() user: User) {
 *     return `${user.firstName} ${user.lastName}`;
 *   }
 * }
 *
 * @Resolver('Post')
 * class PostResolver {
 *   @FieldResolver()
 *   async author(@Parent() post: Post) {
 *     return this.userService.findById(post.authorId);
 *   }
 * }
 * ```
 */
export function Parent(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingParams: ParentMetadata[] =
      Reflect.getMetadata(PARENT_METADATA, target, propertyKey as string) || [];

    existingParams.push({
      index: parameterIndex,
    });

    Reflect.defineMetadata(
      PARENT_METADATA,
      existingParams,
      target,
      propertyKey as string,
    );
  };
}

/** Alias for @Parent decorator. */
export const Root = Parent;
