/**
 * Cache decorators for method-level cache control.
 *
 * This module provides decorators to configure caching behavior
 * on controller methods.
 *
 * Available decorators:
 * - {@link CacheKey} - Set custom cache key
 * - {@link CacheTTL} - Set cache expiration time
 *
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get(':id')
 *   @CacheKey((ctx) => `user:${ctx.getArgByIndex(0).params.id}`)
 *   @CacheTTL(60000)
 *   async findOne(@Param('id') id: string) {
 *     return this.usersService.findOne(id);
 *   }
 * }
 * ```
 *
 * @module
 */

export * from "./cache-key.decorator";
export * from "./cache-ttl.decorator";
