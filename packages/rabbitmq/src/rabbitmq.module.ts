import { Module } from "@kiyasov/elysia-nest";
import type { DynamicModule, Provider, ProviderToken } from "@kiyasov/elysia-nest";
import { Logger } from "@kiyasov/elysia-nest";
import { AmqpConnection, RABBITMQ_CONFIG } from "./connection";
import type { RabbitMQConfig } from "./interfaces";

export interface RabbitMQModuleOptions extends RabbitMQConfig {
  /**
   * If true, register module as global
   */
  isGlobal?: boolean;
}

/**
 * RabbitMQ module for @@kiyasov/elysia-nest
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
    // Return existing instance if already created
    if (RabbitMQModule.connectionInstance) {
      return RabbitMQModule.connectionInstance;
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
      providers,
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
  RabbitInterceptor,
  RabbitPayload,
  RabbitPriority,
  RabbitQueueArguments,
  RabbitRetry,
  RabbitRPC,
  RabbitSubscribe,
  RabbitTTL,
} from "./decorators";
export type {
  ConnectionInitOptions,
  MessageHandlerErrorBehavior,
  RabbitMQChannelConfig,
  RabbitMQConfig,
  RabbitMQConnectionConfig,
  RabbitMQDeserializer,
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
