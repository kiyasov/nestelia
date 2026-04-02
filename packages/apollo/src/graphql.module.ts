import type { Elysia } from "elysia";

import { Module } from "nestelia";
import type { DynamicModule, OnModuleDestroy, ProviderToken } from "nestelia";
import { registerGraphQLRoutes } from "./graphql.controller";
import type { ApolloOptions } from "./interfaces";
import { ApolloService } from "./services";
import { typeMetadataStorage } from "./storages/type-metadata.storage";

/**
 * GraphQL module for nestelia backed by Apollo Server.
 * Provides static and async configuration methods.
 *
 * @example
 * ```typescript
 * GraphQLModule.forRoot({
 *   path: "/graphql",
 *   autoSchemaFile: true,
 *   playground: true,
 * })
 * ```
 */
@Module({})
export class GraphQLModule implements OnModuleDestroy {
  onModuleDestroy(): void {
    typeMetadataStorage.clear();
  }

  /**
   * Configures GraphQL with static options.
   * The Apollo Server is started eagerly during module bootstrap.
   *
   * @param options - GraphQL configuration options.
   * @returns Dynamic module configuration.
   *
   * @example
   * ```typescript
   * import { ElysiaFactory } from 'nestelia';
   *
   * const app = await ElysiaFactory.create(AppModule);
   *
   * @Module({
   *   imports: [
   *     GraphQLModule.forRoot({
   *       path: '/graphql',
   *       autoSchemaFile: true,
   *       playground: true,
   *     })
   *   ]
   * })
   * class AppModule {}
   * ```
   */
  static forRoot(options: ApolloOptions): DynamicModule {
    return {
      module: GraphQLModule,
      global: true,
      providers: [
        {
          provide: "APOLLO_INITIALIZER",
          useFactory: async (elysiaApp: Elysia) => {
            const path = options.path ?? "/graphql";
            const service = new ApolloService(options, elysiaApp);
            await service.start();
            registerGraphQLRoutes(elysiaApp, service, path, options.upload);
            return service;
          },
          inject: ["ELYSIA_APP"],
        },
        {
          provide: ApolloService,
          useFactory: async (initializer: ApolloService) => initializer,
          inject: ["APOLLO_INITIALIZER"],
        },
        {
          provide: "GRAPHQL_OPTIONS",
          useValue: options,
        },
      ],
      exports: [ApolloService, "GRAPHQL_OPTIONS", "APOLLO_INITIALIZER"],
    };
  }

  /**
   * Configures GraphQL with async options resolved from the DI container.
   *
   * @param options - Async configuration options.
   * @returns Dynamic module configuration.
   *
   * @example
   * ```typescript
   * GraphQLModule.forRootAsync({
   *   useFactory: async (configService: ConfigService) => ({
   *     path: '/graphql',
   *     autoSchemaFile: true,
   *     playground: configService.get('NODE_ENV') !== 'production',
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   */
  static forRootAsync(options: {
    useFactory: (...args: unknown[]) => ApolloOptions | Promise<ApolloOptions>;
    inject?: ProviderToken[];
  }): DynamicModule {
    return {
      module: GraphQLModule,
      global: true,
      providers: [
        {
          provide: "APOLLO_INITIALIZER",
          useFactory: async (elysiaApp: Elysia, ...args: unknown[]) => {
            const opts = await options.useFactory(...args);
            const path = opts.path ?? "/graphql";
            const service = new ApolloService(opts, elysiaApp);
            await service.start();
            registerGraphQLRoutes(elysiaApp, service, path, opts.upload);
            return service;
          },
          inject: ["ELYSIA_APP", ...(options.inject ?? [])],
        },
        {
          provide: ApolloService,
          useFactory: async (initializer: ApolloService) => initializer,
          inject: ["APOLLO_INITIALIZER"],
        },
        {
          provide: "GRAPHQL_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
      ],
      exports: [ApolloService, "GRAPHQL_OPTIONS", "APOLLO_INITIALIZER"],
    };
  }
}
