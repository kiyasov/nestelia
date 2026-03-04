/** GraphQL decorators for schema definition. */
export * from "./decorators";

/** GraphQL error classes. */
export * from "./errors";

/** Route registration function. */
export { registerGraphQLRoutes } from "./graphql.controller";

/** GraphQL module. */
export * from "./graphql.module";

/** Helper functions and decorators. */
export * from "./helpers";

/** Interfaces and types. */
export * from "./interfaces";

/** Schema builder class. */
export * from "./schema-builder";

/** Services for GraphQL server management. */
export * from "./services";

/** File upload types and scalar. */
export * from "./upload";

// Compatibility alias
export { FieldResolver as ResolveField } from "./decorators";

// Re-export common GraphQL types
export {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
