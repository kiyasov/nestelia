import type { FactoryProvider, Provider, Type } from "nestelia";
import type { ConfigurableModuleAsyncOptions } from "nestelia";
import { CacheManagerOptions } from "./cache-manager.interface";

/**
 * Base record type for store configuration.
 *
 * @internal
 */
type StoreConfigRecord = Record<string, unknown>;

/**
 * Cache options combining cache manager options with store-specific configuration.
 *
 * Store-specific configuration takes precedence over cache module options
 * due to how `createCacheManager` is implemented.
 *
 * @template T - Store-specific configuration type.
 *
 */
export type CacheOptions<T extends StoreConfigRecord = StoreConfigRecord> =
  CacheManagerOptions & T;

/**
 * Options for configuring the Cache module.
 *
 * @template T - Store-specific configuration type.
 *
 */
export type CacheModuleOptions<
  T extends StoreConfigRecord = StoreConfigRecord,
> = CacheOptions<T> & {
  /**
   * If `true`, register `CacheModule` as a global module.
   *
   * @default false
   */
  isGlobal?: boolean;
};

/**
 * Factory interface for creating cache options.
 *
 * Providers supplying configuration options for the Cache module
 * must implement this interface when using useClass or useExisting.
 *
 * @template T - Store-specific configuration type.
 *
 */
export interface CacheOptionsFactory<
  T extends StoreConfigRecord = StoreConfigRecord,
> {
  /**
   * Creates cache options.
   *
   * @returns Cache options or a Promise resolving to cache options.
   */
  createCacheOptions(): Promise<CacheOptions<T>> | CacheOptions<T>;
}

/**
 * Options for dynamically (asynchronously) configuring the Cache module.
 *
 * This interface provides multiple ways to configure the cache module:
 * - useFactory: Use a factory function
 * - useClass: Use a class implementing CacheOptionsFactory
 * - useExisting: Use an existing provider
 *
 * @template T - Store-specific configuration type.
 *
 */
export interface CacheModuleAsyncOptions<
  T extends StoreConfigRecord = StoreConfigRecord,
> extends ConfigurableModuleAsyncOptions<
  CacheOptions<T>,
  keyof CacheOptionsFactory
> {
  /**
   * Injection token resolving to an existing provider.
   * The provider must implement the `CacheOptionsFactory` interface.
   *
   * @example
   * ```typescript
   * useExisting: ConfigService
   * ```
   */
  useExisting?: Type<CacheOptionsFactory<T>>;

  /**
   * Injection token resolving to a class that will be instantiated as a provider.
   * The class must implement the `CacheOptionsFactory` interface.
   *
   * @example
   * ```typescript
   * useClass: CacheConfigService
   * ```
   */
  useClass?: Type<CacheOptionsFactory<T>>;

  /**
   * Function returning options (or a Promise resolving to options)
   * to configure the cache module.
   *
   * @param args - Dependencies injected from the `inject` array.
   * @returns Cache options or a Promise resolving to cache options.
   *
   * @example
   * ```typescript
   * useFactory: (configService: ConfigService) => ({
   *   ttl: configService.get('CACHE_TTL'),
   *   store: redisStore,
   * }),
   * inject: [ConfigService],
   * ```
   */
  useFactory?: (
    ...args: unknown[]
  ) => Promise<CacheOptions<T>> | CacheOptions<T>;

  /**
   * Dependencies that the factory may inject.
   *
   * @example
   * ```typescript
   * inject: [ConfigService, RedisService]
   * ```
   */
  inject?: FactoryProvider["inject"];

  /**
   * Extra providers to be registered within the scope of this module.
   *
   * Useful for providing dependencies required by the factory function.
   *
   * @example
   * ```typescript
   * extraProviders: [RedisService]
   * ```
   */
  extraProviders?: Provider[];

  /**
   * If `true`, register `CacheModule` as a global module.
   *
   * @default false
   */
  isGlobal?: boolean;
}
