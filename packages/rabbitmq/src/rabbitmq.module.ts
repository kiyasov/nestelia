import { Module, Injectable, Inject, Container } from "nestelia";
import type { DynamicModule, Provider, ProviderToken } from "nestelia";
import { Logger } from "nestelia";
import { AmqpConnection, RABBITMQ_CONFIG } from "./connection";
import { RABBIT_SUBSCRIBE_METADATA, RABBIT_RPC_METADATA } from "./decorators/rabbitmq.decorators";
import type { RabbitMQConfig } from "./interfaces";

/**
 * Internal service that scans all providers for @RabbitSubscribe/@RabbitRPC
 * decorators and registers them with the AmqpConnection on module init.
 */
@Injectable()
class RabbitMQExplorer {
  constructor(
    @Inject(AmqpConnection) private readonly connection: AmqpConnection,
  ) {}

  async onModuleInit(): Promise<void> {
    const container = Container.instance;
    const processedTokens = new Set<unknown>();

    for (const moduleRef of container.getModules().values()) {
      for (const [token, wrapper] of moduleRef.getProviders()) {
        if (processedTokens.has(token)) continue;
        processedTokens.add(token);

        // Only check class-based providers that could have decorators
        if (!wrapper.metatype || typeof wrapper.metatype !== "function") continue;

        const hasSubscribers = Reflect.getMetadata(RABBIT_SUBSCRIBE_METADATA, wrapper.metatype);
        const hasRpc = Reflect.getMetadata(RABBIT_RPC_METADATA, wrapper.metatype);
        if (!hasSubscribers && !hasRpc) continue;

        // Resolve the instance and register its handlers
        try {
          const instance = await container.get(token);
          if (instance) {
            await this.connection.registerHandlers(instance as object);
          }
        } catch (err) {
          // Log the error so handler registration failures are visible
          const name = (wrapper.metatype as { name?: string }).name ?? String(token);
          this.connection.getLogger().error(
            `Failed to register RabbitMQ handlers for ${name}: ${(err as Error).message}. ` +
            `Make sure all exchanges used in @RabbitSubscribe/@RabbitRPC are configured in RabbitMQModule.forRoot({ exchanges: [...] }).`,
          );
        }
      }
    }
  }
}

export interface RabbitMQModuleOptions extends RabbitMQConfig {
  /**
   * If true, register module as global
   */
  isGlobal?: boolean;
}

/**
 * RabbitMQ module for @nestelia
 * Provides RabbitMQ integration with decorators for messaging
 *
 * @example
 * ```typescript
 * @Module({
 *   imports: [
 *     RabbitMQModule.forRoot({
 *       urls: ['amqp://localhost:5672'],
 *       queuePrefix: 'myapp',
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({
  providers: [],
  exports: [],
})
export class RabbitMQModule {
  // Singleton instance and initialization promise to prevent duplicate connections
  private static connectionInstance: AmqpConnection | null = null;
  private static connectionPromise: Promise<AmqpConnection> | null = null;

  /**
   * Get or create connection instance (singleton pattern)
   */
  private static async getOrCreateConnection(
    configFactory: () => Promise<RabbitMQConfig> | RabbitMQConfig,
  ): Promise<AmqpConnection> {
    // If connection already exists, assert any new exchanges/queues from this config
    if (RabbitMQModule.connectionInstance) {
      const config = await configFactory();
      const conn = RabbitMQModule.connectionInstance;
      if (config.exchanges?.length) {
        for (const exchange of config.exchanges) {
          await conn.assertExchange(exchange);
        }
      }
      if (config.queues?.length) {
        for (const queue of config.queues) {
          await conn.assertQueue(queue);
        }
      }
      return conn;
    }

    // If initialization is in progress, wait for it
    if (RabbitMQModule.connectionPromise) {
      return RabbitMQModule.connectionPromise;
    }

    // Create initialization promise to prevent duplicate connections
    RabbitMQModule.connectionPromise = (async () => {
      const config = await configFactory();
      const logger = new Logger("RabbitMQ");
      const connection = new AmqpConnection(config, logger);
      await connection.connect();
      RabbitMQModule.connectionInstance = connection;
      return connection;
    })();

    return RabbitMQModule.connectionPromise;
  }

  /**
   * Create connection provider with given factory
   */
  private static createConnectionProvider(
    configFactory: (
      ...args: unknown[]
    ) => Promise<RabbitMQConfig> | RabbitMQConfig,
    inject: Array<
      ProviderToken | { token: ProviderToken; optional?: boolean }
    > = [],
  ): Provider {
    return {
      provide: AmqpConnection,
      useFactory: async (...args: unknown[]) =>
        this.getOrCreateConnection(() => configFactory(...args)),
      inject,
    };
  }

  /**
   * Create config provider
   */
  private static createConfigProvider(
    configValue: RabbitMQConfig | undefined,
    configFactory:
      | ((...args: unknown[]) => Promise<RabbitMQConfig> | RabbitMQConfig)
      | undefined,
    inject: Array<
      ProviderToken | { token: ProviderToken; optional?: boolean }
    > = [],
  ): Provider {
    if (configFactory) {
      return {
        provide: RABBITMQ_CONFIG,
        useFactory: configFactory,
        inject,
      };
    }
    return {
      provide: RABBITMQ_CONFIG,
      useValue: configValue,
    };
  }

  /**
   * Create module configuration
   */
  private static createModuleConfig(
    providers: Provider[],
    isGlobal: boolean | undefined,
  ): DynamicModule {
    return {
      module: RabbitMQModule,
      global: isGlobal,
      providers: [...providers, RabbitMQExplorer],
      exports: [AmqpConnection, RABBITMQ_CONFIG],
    };
  }

  /**
   * Register RabbitMQ module with configuration
   *
   * @param options RabbitMQ configuration options
   * @returns Dynamic module
   */
  static forRoot(options: RabbitMQModuleOptions): DynamicModule {
    const amqpConnectionProvider = this.createConnectionProvider(
      () => options,
      [],
    );

    const configProvider = this.createConfigProvider(options, undefined);

    return this.createModuleConfig(
      [amqpConnectionProvider, configProvider],
      options.isGlobal,
    );
  }

  /**
   * Register RabbitMQ module with async configuration
   *
   * @example
   * ```typescript
   * RabbitMQModule.forRootAsync({
   *   useFactory: async (configService: ConfigService) => ({
   *     urls: [configService.get('RABBITMQ_URL')],
   *     queuePrefix: configService.get('RABBITMQ_QUEUE_PREFIX'),
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   */
  static forRootAsync(options: {
    useFactory: (
      ...args: unknown[]
    ) => Promise<RabbitMQModuleOptions> | RabbitMQModuleOptions;
    inject?: Array<
      ProviderToken | { token: ProviderToken; optional?: boolean }
    >;
    isGlobal?: boolean;
  }): DynamicModule {
    const inject = options.inject || [];

    const amqpConnectionProvider = this.createConnectionProvider(
      options.useFactory,
      inject,
    );

    const configProvider = this.createConfigProvider(
      undefined,
      options.useFactory,
      inject,
    );

    return this.createModuleConfig(
      [amqpConnectionProvider, configProvider],
      options.isGlobal,
    );
  }

  /**
   * Register a RabbitMQ feature module with specific handlers
   *
   * @param handlers Array of handler classes with @RabbitSubscribe/@RabbitRPC decorators
   * @returns Dynamic module
   */
  static forFeature(handlers: unknown[]): DynamicModule {
    return {
      module: RabbitMQModule,
      providers: handlers as Provider[],
      exports: handlers as Provider[],
    };
  }
}

// Re-export everything
export {
  RabbitBatch,
  RabbitConnection,
  RabbitDLQ,
  RabbitErrorHandler,
  RabbitHandler,
  RabbitHeader,
  RabbitInterceptor,
  RabbitPayload,
  RabbitPriority,
  RabbitQueueArguments,
  RabbitRequest,
  RabbitRetry,
  RabbitRPC,
  RabbitSubscribe,
  RabbitTTL,
} from "./decorators";
export type {
  AssertQueueErrorHandler,
  BatchMessageErrorHandler,
  BatchOptions,
  ConnectionInitOptions,
  MessageErrorHandler,
  MessageHandlerErrorBehavior,
  MessageHandlerOptions,
  QueueOptions,
  RabbitMQChannelConfig,
  RabbitMQConfig,
  RabbitMQConnectionConfig,
  RabbitMQDeserializer,
  RabbitMQExchangeBindingConfig,
  RabbitMQExchangeConfig,
  RabbitMQExchangeType,
  RabbitMQMessage,
  RabbitMQPublishOptions,
  RabbitMQQueueBinding,
  RabbitMQQueueConfig,
  RabbitMQSerializer,
  RabbitRPCOptions,
  RabbitSubscribeOptions,
  RequestOptions,
} from "./interfaces";
export { Nack } from "./nack";
export { isRabbitContext, RABBIT_CONTEXT_TYPE_KEY } from "./rabbitmq.constants";
export {
  AmqpConnection,
  RABBITMQ_CONFIG,
  RABBITMQ_CONNECTION,
  RabbitMQService,
} from "./rabbitmq.service";
