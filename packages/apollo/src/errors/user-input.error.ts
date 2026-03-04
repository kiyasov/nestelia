import { ApolloServerErrorCode } from "@apollo/server/errors";
import { GraphQLError, type GraphQLErrorOptions } from "graphql";

/**
 * Error thrown when the user input is invalid.
 *
 * This class was removed in Apollo Server 4.0.0.
 * This implementation provides the same functionality.
 *
 * @example
 * ```typescript
 * @Mutation()
 * async createUser(@Args('input') input: CreateUserInput) {
 *   if (!input.email.includes('@')) {
 *     throw new UserInputError('Invalid email format');
 *   }
 *   return this.userService.create(input);
 * }
 * ```
 */
export class UserInputError extends GraphQLError {
  /**
   * Creates a new UserInputError.
   * @param message - Error message.
   * @param options - Additional GraphQL error options.
   */
  constructor(message: string, options?: GraphQLErrorOptions) {
    super(message, {
      ...options,
      extensions: {
        code: ApolloServerErrorCode.BAD_USER_INPUT,
        ...options?.extensions,
      },
    });
  }
}
