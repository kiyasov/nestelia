import type { Redis } from "ioredis";

import { Module } from "@kiyasov/elysia-nest";
import { Global } from "@kiyasov/elysia-nest";
import type { Provider, ProviderToken } from "@kiyasov/elysia-nest";
import type { RedisPubSubOptions } from "./interfaces";
import { RedisPubSub } from "./redis-pubsub";

/** DI token for the raw `RedisPubSubOptions` object. */
export const GRAPHQL_PUBSUB_OPTIONS = "GRAPHQL_PUBSUB_OPTIONS";
/** DI token for the `RedisPubSub` instance. Use {@link InjectPubSub} for convenience. */
export const GRAPHQL_PUBSUB = "GRAPHQL_PUBSUB";

/**
 * Options accepted by {@link GraphQLPubSubModule.forRoot}.
 *
 * Exactly one of `useValue`, `useExisting`, or `useFactory` should be provided.
 */
export interface GraphQLPubSubModuleOptions {
  /**
   * Synchronous factory function that returns {@link RedisPubSubOptions}.
   * Prefer {@link GraphQLPubSubModule.forRootAsync} when async config is needed.
   */
  useFactory?: (
    ...args: unknown[]
  ) => RedisPubSubOptions | Promise<RedisPubSubOptions>;
  /**
   * Pre-created publisher and subscriber Redis clients.
   * Use this when you manage Redis connections outside of the module.
   */
  useExisting?: {
    publisher: Redis;
    subscriber: Redis;
    keyPrefix?: string;
  };
  /** Plain configuration object passed directly to {@link RedisPubSub}. */
  useValue?: RedisPubSubOptions;
  /**
   * When `true` (default) the module is registered globally and the
   * {@link GRAPHQL_PUBSUB} token is available application-wide without
   * importing this module in every feature module.
   */
  isGlobal?: boolean;
}

// ─── Internal module classes ──────────────────────────────────────────────────

@Module({})
class GraphQLPubSubModuleCore {}

@Global()
@Module({})
class GraphQLPubSubGlobalModule {}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Feature module that provides a {@link RedisPubSub} instance for use with
 * GraphQL subscriptions.
 *
 * Register it once at the root level using {@link forRoot} or
 * {@link forRootAsync}, then inject the instance anywhere with
 * `@Inject(GRAPHQL_PUBSUB)` or the {@link InjectPubSub} shortcut.
 *
 * @example
 * ```typescript
 * // Synchronous — static Redis options
 * @Module({
 *   imports: [
 *     GraphQLPubSubModule.forRoot({
 *       useValue: { connection: { host: "localhost", port: 6379 } },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 *
 * // Asynchronous — derive options from another provider
 * @Module({
 *   imports: [
 *     GraphQLPubSubModule.forRootAsync({
 *       inject: [ConfigService],
 *       useFactory: (config: ConfigService) => ({
 *         connection: { host: config.get("REDIS_HOST"), port: 6379 },
 *       }),
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
export class GraphQLPubSubModule {
  /**
   * Registers the module with a synchronous configuration.
   *
   * The returned class is decorated with `@Global` by default (override with
   * `isGlobal: false`).
   */
  static forRoot(
    options: GraphQLPubSubModuleOptions = {},
  ): typeof GraphQLPubSubModuleCore {
    const providers: Provider[] = options.useExisting
      ? [
          {
            provide: GRAPHQL_PUBSUB,
            useValue: new RedisPubSub({
              publisher: options.useExisting.publisher,
              subscriber: options.useExisting.subscriber,
              keyPrefix: options.useExisting.keyPrefix,
            }),
          },
        ]
      : [
          {
            provide: GRAPHQL_PUBSUB,
            useFactory: (opts: RedisPubSubOptions): RedisPubSub =>
              new RedisPubSub(opts),
            inject: [GRAPHQL_PUBSUB_OPTIONS],
          },
          {
            provide: GRAPHQL_PUBSUB_OPTIONS,
            useValue: options.useValue ?? {},
          },
        ];

    const moduleClass =
      options.isGlobal !== false
        ? GraphQLPubSubGlobalModule
        : GraphQLPubSubModuleCore;

    Reflect.defineMetadata("providers", providers, moduleClass);
    Reflect.defineMetadata("exports", [GRAPHQL_PUBSUB], moduleClass);

    return moduleClass as typeof GraphQLPubSubModuleCore;
  }

  /**
   * Registers the module with an asynchronous configuration.
   *
   * The `useFactory` is resolved once by the DI container and its result is
   * stored under the {@link GRAPHQL_PUBSUB_OPTIONS} token. The
   * {@link GRAPHQL_PUBSUB} provider then receives the resolved options
   * as its first argument.
   *
   * @example
   * ```typescript
   * GraphQLPubSubModule.forRootAsync({
   *   inject: [ConfigService],
   *   useFactory: async (config: ConfigService) => ({
   *     connection: { host: await config.getRedisHost(), port: 6379 },
   *   }),
   * });
   * ```
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: unknown[]
    ) => RedisPubSubOptions | Promise<RedisPubSubOptions>;
    inject?: ProviderToken[];
    isGlobal?: boolean;
  }): typeof GraphQLPubSubModuleCore {
    const providers: Provider[] = [
      {
        // Receives the already-resolved RedisPubSubOptions from GRAPHQL_PUBSUB_OPTIONS.
        provide: GRAPHQL_PUBSUB,
        useFactory: (opts: RedisPubSubOptions): RedisPubSub =>
          new RedisPubSub(opts),
        inject: [GRAPHQL_PUBSUB_OPTIONS],
      },
      {
        provide: GRAPHQL_PUBSUB_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject ?? [],
      },
    ];

    const moduleClass =
      options.isGlobal !== false
        ? GraphQLPubSubGlobalModule
        : GraphQLPubSubModuleCore;

    Reflect.defineMetadata("providers", providers, moduleClass);
    Reflect.defineMetadata("exports", [GRAPHQL_PUBSUB], moduleClass);

    return moduleClass as typeof GraphQLPubSubModuleCore;
  }
}

export { GraphQLPubSubGlobalModule, GraphQLPubSubModuleCore };
