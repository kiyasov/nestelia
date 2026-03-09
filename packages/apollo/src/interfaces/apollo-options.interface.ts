import type { ApolloServerOptions, BaseContext } from "@apollo/server";
import type {
  ExecutionArgs,
  GraphQLDirective,
  GraphQLError,
  GraphQLFormattedError,
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLSchema,
} from "graphql";

import type { ExecutionContext } from "nestelia";

/** Date scalar serialization mode. */
export type DateScalarMode = "isoDate" | "timestamp";

/** Number scalar serialization mode. */
export type NumberScalarMode = "float" | "integer";

type Constructor = new (...args: unknown[]) => unknown;

/** Mapping between TypeScript types and GraphQL scalars. */
export interface ScalarsTypeMap {
  /** TypeScript type constructor. */
  type: Constructor;
  /** GraphQL scalar type. */
  scalar: GraphQLScalarType;
}

/** Runtime context for GraphQL operations. */
export interface GraphQLRuntimeContext {
  /** Extra data including WebSocket socket reference. */
  extra?: {
    socket?: unknown;
  };
  /** HTTP request object. */
  req?: Request;
  /** HTTP request object (alias). */
  request?: Request;
  /** HTTP headers. */
  headers?: Record<string, string | undefined>;
  /** WebSocket connection parameters. */
  connectionParams?: Record<string, unknown>;
  /** Additional context properties. */
  [key: string]: unknown;
}

/** GraphQL context available in resolvers. */
export interface GraphQLContext {
  /** HTTP request object. */
  req?: Request;
  /** Runtime context. */
  ctx?: GraphQLRuntimeContext;
  /** Current user (if authenticated). */
  user?: { userId?: string } | null;
  /** Additional context properties. */
  [key: string]: unknown;
}

/** Options for building the GraphQL schema. */
export interface BuildSchemaOptions {
  /** Date scalar mode (ISO string or timestamp). */
  dateScalarMode?: DateScalarMode;
  /** Number scalar mode (float or integer). */
  numberScalarMode?: NumberScalarMode;
  /** Custom scalar type mappings. */
  scalarsMap?: ScalarsTypeMap[];
  /** Types that are not directly referenced but should be included. */
  orphanedTypes?: Array<Constructor | object>;
  /** Skip schema validation. */
  skipCheck?: boolean;
  /** Custom directives to include. */
  directives?: GraphQLDirective[];
  /** Prevent duplicate field definitions. */
  noDuplicatedFields?: boolean;
  /** Add newline at end of generated schema file. */
  addNewlineAtEnd?: boolean;
}

/** Context for GraphQL WebSocket connections. */
export interface GraphQLWsContext {
  /** Connection parameters from the client. */
  connectionParams?: Record<string, unknown>;
  /** HTTP headers. */
  headers?: Record<string, string | undefined>;
  /** HTTP request object. */
  request?: Request;
}

/** Options for GraphQL WebSocket subscriptions (graphql-ws protocol). */
export interface GraphQLWsSubscriptionsOptions {
  /** WebSocket endpoint path. */
  path?: string;
  /** Timeout for connection initialization in milliseconds. */
  connectionInitWaitTimeout?: number;
  /** Callback when a client connects. */
  onConnect?: (
    context: GraphQLWsContext,
  ) =>
    | void
    | boolean
    | Record<string, unknown>
    | Promise<void | boolean | Record<string, unknown>>;
  /** Callback when a client disconnects. */
  onDisconnect?: (context: GraphQLWsContext) => void | Promise<void>;
  /** Callback when a connection closes. */
  onClose?: (context: GraphQLWsContext) => void | Promise<void>;
  /** Callback when a subscription is created. */
  onSubscribe?: (
    context: GraphQLWsContext,
    id: string,
    payload: unknown,
  ) =>
    | void
    | ExecutionArgs
    | readonly GraphQLError[]
    | Promise<void | ExecutionArgs | readonly GraphQLError[]>;
  /** Callback when a subscription emits a value. */
  onNext?: (
    context: GraphQLWsContext,
    id: string,
    payload: unknown,
    args: ExecutionArgs,
    result: unknown,
  ) => void | Promise<void>;
}

/** Options for legacy subscriptions-transport-ws protocol. */
export interface GraphQLSubscriptionTransportWsOptions {
  /** WebSocket endpoint path. */
  path?: string;
  /** Keep-alive interval in milliseconds. */
  keepAlive?: number;
  /** Callback when a client connects. */
  onConnect?: (connectionParams?: Record<string, unknown>) => unknown;
  /** Callback when a client disconnects. */
  onDisconnect?: () => void;
  /** Callback for each operation. */
  onOperation?: (message: unknown, params: unknown) => unknown;
}

/** Subscription configuration supporting multiple protocols. */
export type SubscriptionConfig = {
  "graphql-ws"?: GraphQLWsSubscriptionsOptions | boolean;
  "subscriptions-transport-ws"?:
    | GraphQLSubscriptionTransportWsOptions
    | boolean;
};

/** Options for configuring the GraphQL / Apollo module. */
export interface ApolloOptions<TContext = unknown> {
  /** GraphQL endpoint path. @default '/graphql' */
  path?: string;
  /** Pre-built GraphQL schema. Mutually exclusive with `autoSchemaFile`. */
  schema?: GraphQLSchema;
  /** SDL type definitions. Used together with `resolvers`. */
  typeDefs?: string | string[];
  /** Resolver map. Used together with `typeDefs`. */
  resolvers?: Record<string, unknown> | Array<Record<string, unknown>>;
  /** Context factory called for every request. */
  context?: (context: ApolloContext) => TContext | Promise<TContext>;
  /** Enable Apollo Studio Sandbox landing page. @default true in development */
  playground?: boolean;
  /** Custom error formatter. */
  formatError?: (
    formattedError: GraphQLFormattedError,
    error: unknown,
  ) => GraphQLFormattedError;
  /** Enable WebSocket subscriptions or pass graphql-ws options. */
  subscriptions?: boolean | SubscriptionConfig;
  /** WebSocket endpoint for subscriptions. */
  subscriptionsPath?: string;
  /**
   * When `true`, generates schema from code-first decorators in memory.
   * When a string path is provided, also writes the SDL to that file.
   */
  autoSchemaFile?: boolean | string;
  /** Additional options used while building code-first schema. */
  buildSchemaOptions?: BuildSchemaOptions;
  /** Sort schema fields alphabetically. */
  sortSchema?: boolean;
  /** Additional Apollo Server plugins. */
  plugins?: ApolloServerOptions<BaseContext>["plugins"];
}

/** Elysia-specific GraphQL request context. */
export interface ApolloContext {
  /** HTTP request object. */
  request: Request;
  /** HTTP response object. */
  response: Response;
  /** Route parameters. */
  params: Record<string, string>;
  /** Elysia store. */
  store: Record<string, unknown>;
  /** Original Elysia context. */
  elysiaContext: unknown;
}

/** Context accessor for GraphQL resolvers - mirrors the GqlExecutionContext API. */
export interface GqlExecutionContext<TContext = GraphQLContext> {
  /** Gets the resolver arguments. */
  getArgs<T = Record<string, unknown>>(): T;
  /** Gets the name of the current field being resolved. */
  getFieldName(): string;
  /** Gets the operation type (query, mutation, subscription). */
  getOperation(): string | undefined;
  /** Gets the GraphQL variables. */
  getVariables<T = Record<string, unknown>>(): T;
  /** Gets the GraphQL context. */
  getContext(): TContext;
  /** Gets the parent object (for field resolvers). */
  getParent<T = unknown>(): T;
  /** Gets the GraphQL resolve info. */
  getInfo(): GraphQLResolveInfo;
}

/** Static interface for creating GqlExecutionContext instances. */
export interface GqlExecutionContextStatic {
  /**
   * Creates a GqlExecutionContext from an ExecutionContext.
   * @param context - The execution context.
   * @returns A GqlExecutionContext instance.
   */
  create<TContext = GraphQLContext>(
    context: ExecutionContext,
  ): GqlExecutionContext<TContext>;
}

/**
 * Utility for creating GraphQL execution contexts.
 * Provides access to resolver arguments, context, and GraphQL-specific information.
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     const gqlContext = GqlExecutionContext.create(context);
 *     const user = gqlContext.getContext().user;
 *     return !!user;
 *   }
 * }
 * ```
 */
export const GqlExecutionContext: GqlExecutionContextStatic = {
  create<TContext = GraphQLContext>(
    context: ExecutionContext,
  ): GqlExecutionContext<TContext> {
    // In GraphQL resolvers the execution context args are [parent, args, ctx, info]
    const raw = context as unknown as {
      getArgs?: () => unknown[];
      args?: unknown[];
    };
    const rawArgs: unknown[] = raw.getArgs?.() ?? (raw as unknown as unknown[]);
    const [parent, args, ctx, info] = rawArgs as [
      unknown,
      Record<string, unknown>,
      TContext,
      GraphQLResolveInfo,
    ];

    return {
      getArgs: <T>() => args as T,
      getFieldName: () => info?.fieldName ?? "",
      getOperation: () => info?.operation?.operation,
      getVariables: <T>() => (info?.variableValues as T) ?? ({} as T),
      getContext: () => ctx,
      getParent: <T>() => parent as T,
      getInfo: () => info,
    };
  },
};

/** Type identifier for GraphQL context type. */
export type GqlContextType = "graphql";
