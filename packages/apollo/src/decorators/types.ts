import type { GraphQLFieldConfigArgumentMap } from "graphql";

/** Constructor type for class references. */
export type Constructor<T = unknown> = new (...args: unknown[]) => T;

/** @Resolver metadata. */
export interface ResolverMetadata {
  /** Name of the type this resolver is for. */
  name?: string | Constructor;
  /** Whether this is a functional resolver. */
  isFunctional?: boolean;
  /** Description of the resolver. */
  description?: string;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Extensions. */
  extensions?: Record<string, unknown>;
}

/** Base field metadata (Query, Mutation, Subscription, FieldResolver). */
export interface BaseFieldMetadata {
  /** Field name (defaults to method name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Whether field is nullable. */
  nullable?: boolean;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Return type. */
  returnType?: (() => unknown) | Constructor | string;
  /** Extensions. */
  extensions?: Record<string, unknown>;
}

/** @Query metadata. */
export interface QueryMetadata extends BaseFieldMetadata {
  kind: "query";
  methodName: string;
}

/** @Mutation metadata. */
export interface MutationMetadata extends BaseFieldMetadata {
  kind: "mutation";
  methodName: string;
}

/** Subscription subscribe function. */
export type SubscribeFn<T = unknown> = (
  source: AsyncIterator<T>,
  args: Record<string, unknown>,
  context: unknown,
  info: unknown,
) => AsyncIterator<T>;

/** Subscription resolve function. */
export type ResolveFn<T = unknown> = (
  payload: T,
  args: Record<string, unknown>,
  context: unknown,
  info: unknown,
) => unknown | Promise<unknown>;

/** @Subscription metadata. */
export interface SubscriptionMetadata extends BaseFieldMetadata {
  kind: "subscription";
  methodName: string;
  /** Subscribe function (for custom pub/sub). */
  subscribe?: SubscribeFn;
  /** Resolve function to transform payload. */
  resolve?: ResolveFn;
}

/** @FieldResolver metadata. */
export interface FieldResolverMetadata extends BaseFieldMetadata {
  kind: "fieldResolver";
  methodName: string;
  /** Name of the field being resolved. */
  fieldName?: string;
}

/** @ObjectType metadata. */
export interface ObjectTypeMetadata {
  /** Type name (defaults to class name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Interfaces implemented. */
  implements?: Constructor | Constructor[];
  /** Extensions. */
  extensions?: Record<string, unknown>;
  /** Is this the default for a union. */
  isAbstract?: boolean;
}

/** @InputType metadata. */
export interface InputTypeMetadata {
  /** Type name (defaults to class name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Extensions. */
  extensions?: Record<string, unknown>;
}

/** @InterfaceType metadata. */
export interface InterfaceTypeMetadata {
  /** Type name (defaults to class name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Resolve type function. */
  resolveType?: (
    value: unknown,
    context: unknown,
    info: unknown,
  ) => string | null;
  /** Extensions. */
  extensions?: Record<string, unknown>;
}

/** @Field metadata. */
export interface FieldMetadata {
  /** Field name (defaults to property name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Field type. */
  type?: Constructor | string;
  /** Whether field is nullable. */
  nullable?: boolean;
  /** Deprecation reason. */
  deprecationReason?: string;
  /** Default value. */
  defaultValue?: unknown;
  /** Extensions. */
  extensions?: Record<string, unknown>;
}

/** @Args metadata. */
export interface ArgsMetadata {
  kind: "args";
  index: number;
}

/** @Arg metadata. */
export interface ArgMetadata {
  kind: "arg";
  index: number;
  /** Argument name. */
  name: string;
  /** Argument type. */
  argType?: (() => unknown) | Constructor | string;
  /** Description. */
  description?: string;
  /** Whether nullable. */
  nullable?: boolean;
  /** Default value. */
  defaultValue?: unknown;
}

/** @Context metadata. */
export interface ContextMetadata {
  kind: "context";
  index: number;
}

/** @Parent/Root metadata. */
export interface ParentMetadata {
  kind: "parent";
  index: number;
}

/** @Info metadata. */
export interface InfoMetadata {
  kind: "info";
  index: number;
}

/** Union parameter metadata. */
export type ParamMetadata =
  | ArgsMetadata
  | ArgMetadata
  | ContextMetadata
  | ParentMetadata
  | InfoMetadata;

/** @Enum metadata. */
export interface EnumMetadata {
  /** Enum name (defaults to class name). */
  name?: string;
  /** Description. */
  description?: string;
}

/** @Scalar metadata. */
export interface ScalarMetadata {
  /** Scalar name (defaults to class name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Type reference this scalar should handle (e.g. () => Date). */
  typeFn?: () => unknown;
}

/** @Union metadata. */
export interface UnionMetadata {
  /** Union name (defaults to class name). */
  name?: string;
  /** Description. */
  description?: string;
  /** Types in the union. */
  types: Constructor[];
  /** Resolve type function. */
  resolveType?: (value: unknown) => string | null;
}

/** @Directive metadata. */
export interface DirectiveMetadata {
  /** Directive name. */
  name: string;
  /** Description. */
  description?: string;
  /** Locations where directive can be used. */
  locations: readonly string[];
  /** Arguments. */
  args?: GraphQLFieldConfigArgumentMap;
  /** Whether directive is repeatable. */
  isRepeatable?: boolean;
}

/** @ReturnType metadata. */
export interface ReturnTypeMetadata {
  /** Return type. */
  type: Constructor | string;
  /** Whether nullable. */
  nullable?: boolean;
}
