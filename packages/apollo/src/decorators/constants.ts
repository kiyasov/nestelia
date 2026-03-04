import "reflect-metadata";

/**
 * Metadata keys for GraphQL decorators.
 * These constants are used with reflect-metadata to store and retrieve
 * decorator metadata on classes, methods, and properties.
 */

// Class decorators
/** Metadata key for @Resolver decorator. */
export const RESOLVER_METADATA = "graphql:resolver";
/** Metadata key for @ObjectType decorator. */
export const OBJECT_TYPE_METADATA = "graphql:objectType";
/** Metadata key for @InputType decorator. */
export const INPUT_TYPE_METADATA = "graphql:inputType";
/** Metadata key for @InterfaceType decorator. */
export const INTERFACE_TYPE_METADATA = "graphql:interfaceType";
/** Metadata key for @Enum decorator. */
export const ENUM_METADATA = "graphql:enum";
/** Metadata key for @Scalar decorator. */
export const SCALAR_METADATA = "graphql:scalar";
/** Metadata key for @Directive decorator. */
export const DIRECTIVE_METADATA = "graphql:directive";
/** Metadata key for @Union decorator. */
export const UNION_METADATA = "graphql:union";

// Method decorators
/** Metadata key for @Query decorator. */
export const QUERY_METADATA = "graphql:query";
/** Metadata key for @Mutation decorator. */
export const MUTATION_METADATA = "graphql:mutation";
/** Metadata key for @Subscription decorator. */
export const SUBSCRIPTION_METADATA = "graphql:subscription";
/** Metadata key for @FieldResolver decorator. */
export const FIELD_RESOLVER_METADATA = "graphql:fieldResolver";

// Property decorators
/** Metadata key for @Field decorator. */
export const FIELD_METADATA = "graphql:field";
/** Metadata key for hidden fields. */
export const HIDDEN_FIELDS_METADATA = "graphql:hiddenFields";

// Parameter decorators
/** Metadata key for @Args decorator. */
export const ARGS_METADATA = "graphql:args";
/** Metadata key for @Context decorator. */
export const CONTEXT_METADATA = "graphql:context";
/** Metadata key for @Parent decorator. */
export const PARENT_METADATA = "graphql:parent";
/** Metadata key for @Info decorator. */
export const INFO_METADATA = "graphql:info";

// Return type metadata
/** Metadata key for return type information. */
export const RETURN_TYPE_METADATA = "graphql:returnType";

// General options
/** Metadata key for GraphQL options. */
export const GQL_OPTIONS_METADATA = "graphql:options";

// Additional metadata keys
/** Metadata key for @ArgsType decorator. */
export const ARGS_TYPE_METADATA = "graphql:argsType";
/** Metadata key for union types created via createUnionType. */
export const UNION_TYPE_METADATA = "graphql:unionType";
