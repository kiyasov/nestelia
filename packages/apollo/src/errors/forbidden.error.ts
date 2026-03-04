import { GraphQLError, type GraphQLErrorOptions } from "graphql";

/**
 * Error thrown when the user is not authorized to access a resource.
 *
 * This class was removed in Apollo Server 4.0.0.
 * This implementation provides the same functionality.
 *
 * @example
 * ```typescript
 * @Query()
 * async adminData(@Context() ctx: MyContext) {
 *   if (!ctx.user.isAdmin) {
 *     throw new ForbiddenError('Admin access required');
 *   }
 *   return this.service.getAdminData();
 * }
 * ```
 */
export class ForbiddenError extends GraphQLError {
  /**
   * Creates a new ForbiddenError.
   * @param message - Error message.
   * @param options - Additional GraphQL error options.
   */
  constructor(message: string, options?: GraphQLErrorOptions) {
    super(message, {
      ...options,
      extensions: {
        code: "FORBIDDEN",
        ...options?.extensions,
      },
    });
  }
}
