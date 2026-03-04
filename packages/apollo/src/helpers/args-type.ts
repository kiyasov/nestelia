import "reflect-metadata";

import { ARGS_TYPE_METADATA } from "../decorators/constants";

/**
 * Marks a class as GraphQL arguments DTO.
 * Classes decorated with @ArgsType can be used as input types for resolver arguments.
 *
 * @example
 * ```typescript
 * @ArgsType()
 * class GetUsersArgs {
 *   @Field(() => Int, { nullable: true })
 *   skip?: number;
 *
 *   @Field(() => Int, { nullable: true })
 *   take?: number;
 * }
 *
 * @Resolver()
 * class UserResolver {
 *   @Query(() => [User])
 *   async users(@Args() args: GetUsersArgs) {
 *     return this.userService.findAll(args);
 *   }
 * }
 * ```
 */
export function ArgsType(): <
  T extends abstract new (...args: unknown[]) => unknown,
>(
  target: T,
) => T {
  return (target) => {
    Reflect.defineMetadata(ARGS_TYPE_METADATA, true, target);
    return target;
  };
}
