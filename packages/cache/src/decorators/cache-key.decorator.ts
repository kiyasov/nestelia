import { SetMetadata } from "nestelia";
import { ExecutionContext } from "nestelia";
import { CACHE_KEY_METADATA } from "../cache.constants";

/**
 * Factory function type for generating cache keys dynamically.
 *
 * This function receives the execution context and returns a string key.
 * Useful for generating keys based on request parameters, headers, or user context.
 *
 * @param context - The execution context containing request information.
 * @returns The cache key string.
 *
 * @example
 * ```typescript
 * const keyFactory: CacheKeyFactory = (ctx) => {
 *   const request = ctx.switchToHttp().getRequest();
 *   return `user:${request.user.id}:profile`;
 * };
 * ```
 *
 * @publicApi
 */
export type CacheKeyFactory = (ctx: ExecutionContext) => string;

/**
 * Decorator that sets the caching key used to store/retrieve cached items.
 *
 * This decorator is useful for WebSocket or Microservice-based applications
 * where automatic URL-based key generation is not available.
 *
 * @param key - A static string key or a factory function that generates a key.
 *
 * @returns A decorator function that sets the metadata.
 *
 * @example
 * Static key:
 * ```typescript
 * @CacheKey('events')
 * @Get('events')
 * async getEvents() {
 *   return this.eventsService.findAll();
 * }
 * ```
 *
 * @example
 * Dynamic key with factory:
 * ```typescript
 * @CacheKey((ctx) => {
 *   const request = ctx.switchToHttp().getRequest();
 *   return `user:${request.params.id}`;
 * })
 * @Get(':id')
 * async getUser(@Param('id') id: string) {
 *   return this.usersService.findOne(id);
 * }
 * ```
 *
 * @publicApi
 */
export const CacheKey = (key: string | CacheKeyFactory) =>
  SetMetadata(CACHE_KEY_METADATA, key);
