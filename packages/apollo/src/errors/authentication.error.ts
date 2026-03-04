import { GraphQLError, type GraphQLErrorOptions } from "graphql";

/**
 * Error thrown when the user is not authenticated.
 *
 * This class was removed in Apollo Server 4.0.0.
 * This implementation provides the same functionality.
 *
 * @example
 * ```typescript
 * @Query()
 * async sensitiveData(@Context() ctx: MyContext) {
 *   if (!ctx.user) {
 *     throw new AuthenticationError('You must be logged in');
 *   }
 *   return this.service.getData();
 * }
 * ```
 */
export class AuthenticationError extends GraphQLError {
  /**
   * Creates a new AuthenticationError.
   * @param message - Error message.
   * @param options - Additional GraphQL error options.
   */
  constructor(message: string, options?: GraphQLErrorOptions) {
    super(message, {
      ...options,
      extensions: {
        code: "UNAUTHENTICATED",
        ...options?.extensions,
      },
    });
  }
}
