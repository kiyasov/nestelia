/**
 * Cache interceptors for automatic HTTP request caching.
 *
 * This module provides interceptors that automatically cache
 * HTTP responses based on request URL and configured TTL.
 *
 * Available interceptors:
 * - {@link CacheInterceptor} - Main interceptor for HTTP caching
 *
 * @example
 * ```typescript
 * @Controller('items')
 * @UseInterceptors(CacheInterceptor)
 * export class ItemController {
 *   @Get()
 *   findAll() {
 *     return this.itemsService.findAll();
 *   }
 * }
 * ```
 *
 * @module
 */

export * from "./cache.interceptor";
