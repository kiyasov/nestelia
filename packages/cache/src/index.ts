/**
 * @packageDocumentation
 *
 * Elysia-Nest Cache Manager Module
 *
 * A comprehensive caching module for Elysia-Nest applications, providing:
 * - In-memory and Redis caching support
 * - HTTP request/response caching via interceptor
 * - Decorators for fine-grained cache control
 * - Multi-tier caching with non-blocking operations
 *
 * @example
 * Quick start:
 * ```typescript
 * import { CacheModule } from '@nestelia/cache-manager';
 *
 * @Module({
 *   imports: [CacheModule.register()],
 * })
 * export class AppModule {}
 * ```
 *
 * @module
 */

export * from "./cache.constants";
export * from "./cache.module";
export * from "./decorators";
export * from "./interceptors";
export * from "./interfaces";
