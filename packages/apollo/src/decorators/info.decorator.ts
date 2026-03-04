import "reflect-metadata";

import { INFO_METADATA } from "./constants";

/** GraphQL info metadata stored in Reflect. */
export interface InfoMetadata {
  /** Parameter index in the method signature. */
  index: number;
}

/**
 * Decorator for GraphQL resolve info.
 * Provides access to GraphQL request information (AST, field nodes, etc.).
 *
 * @example
 * ```typescript
 * import { GraphQLResolveInfo } from 'graphql';
 *
 * @Query()
 * async users(@Info() info: GraphQLResolveInfo) {
 *   // Access request AST for optimization
 *   const fields = getFieldNames(info);
 *   return this.userService.findAll({ fields });
 * }
 *
 * @Query()
 * async user(
 *   @Args('id') id: string,
 *   @Info() info: GraphQLResolveInfo
 * ) {
 *   // Use info for DataLoader or query optimization
 *   return this.userService.findById(id, info);
 * }
 * ```
 */
export function Info(): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const existingParams: InfoMetadata[] =
      Reflect.getMetadata(INFO_METADATA, target, propertyKey as string) || [];

    existingParams.push({
      index: parameterIndex,
    });

    Reflect.defineMetadata(
      INFO_METADATA,
      existingParams,
      target,
      propertyKey as string,
    );
  };
}
