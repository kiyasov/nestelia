import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLErrorOptions } from "graphql";

/**
 * Error thrown when the user input does not pass validation.
 *
 * This class was removed in Apollo Server 4.0.0.
 * This implementation provides the same functionality.
 *
 * @example
 * ```typescript
 * @Mutation()
 * async updateUser(@Args('input') input: UpdateUserInput) {
 *   if (input.age < 0) {
 *     throw new ValidationError('Age must be positive');
 *   }
 *   return this.userService.update(input);
 * }
 * ```
 */
export class ValidationError extends GraphQLError {
  /**
   * Creates a new ValidationError.
   * @param message - Error message.
   * @param options - Additional GraphQL error options.
   */
  constructor(message: string, options?: GraphQLErrorOptions) {
    super(message, {
      ...options,
      extensions: {
        code: ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
        ...options?.extensions,
      },
    });
  }
}
