import { SetMetadata } from "nestelia";
import { ExecutionContext } from "nestelia";
import { CACHE_TTL_METADATA } from "../cache.constants";

/**
 * Factory function type for generating TTL (time-to-live) values dynamically.
 *
 * This function receives the execution context and returns a TTL in milliseconds.
 * Can be async for cases where TTL needs to be fetched from external sources.
 *
 * @param context - The execution context containing request information.
 * @returns The TTL in milliseconds, or a Promise resolving to TTL.
 *
 * @example
 * ```typescript
 * const ttlFactory: CacheTTLFactory = (ctx) => {
 *   const request = ctx.switchToHttp().getRequest();
 *   // Premium users get longer cache
 *   return request.user.isPremium ? 3600000 : 60000;
 * };
 * ```
 *
 */
export type CacheTTLFactory = (
  ctx: ExecutionContext,
) => Promise<number> | number;

/**
 * Decorator that sets the cache TTL (time-to-live) duration.
 *
 * TTL determines how long an item remains in the cache before expiration.
 * Value is specified in milliseconds.
 *
 * @param ttl - A static TTL value in milliseconds, or a factory function.
 *
 * @returns A decorator function that sets the metadata.
 *
 * @example
 * Static TTL (5 seconds):
 * ```typescript
 * @CacheTTL(5000)
 * @Get('data')
 * async getData() {
 *   return this.dataService.findAll();
 * }
 * ```
 *
 * @example
 * Dynamic TTL with factory:
 * ```typescript
 * @CacheTTL((ctx) => {
 *   const request = ctx.switchToHttp().getRequest();
 *   // Cache expensive queries longer
 *   return request.query.complex ? 60000 : 10000;
 * })
 * @Get('search')
 * async search(@Query() query: SearchQuery) {
 *   return this.searchService.search(query);
 * }
 * ```
 *
 */
export const CacheTTL = (ttl: number | CacheTTLFactory) =>
  SetMetadata(CACHE_TTL_METADATA, ttl);
