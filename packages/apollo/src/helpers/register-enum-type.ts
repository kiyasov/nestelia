import "reflect-metadata";

import { ENUM_METADATA } from "../decorators/constants";
import { typeMetadataStorage } from "../storages/type-metadata.storage";

/**
 * Registers an enum type with a custom name and description for GraphQL schema generation.
 * Must be called before the schema is built (e.g., at module level).
 *
 * @typeParam TEnum - The enum type.
 * @param enumObj - The enum object to register.
 * @param config - Configuration for the enum type.
 *
 * @example
 * ```typescript
 * enum UserRole {
 *   ADMIN = 'ADMIN',
 *   USER = 'USER',
 * }
 *
 * registerEnumType(UserRole, {
 *   name: 'UserRole',
 *   description: 'User roles in the system',
 * });
 *
 * @ObjectType()
 * class User {
 *   @Field(() => UserRole)
 *   role: UserRole;
 * }
 * ```
 */
export function registerEnumType<TEnum extends object>(
  enumObj: TEnum,
  config: { name: string; description?: string },
): void {
  typeMetadataStorage.addEnum(enumObj, {
    name: config.name,
    description: config.description,
  });
  Reflect.defineMetadata(
    ENUM_METADATA,
    { name: config.name, description: config.description },
    enumObj,
  );
}
