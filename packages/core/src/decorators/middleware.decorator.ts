import { Injectable } from "../di/injectable.decorator";
import type { InjectableOptions } from "../di/injectable.decorator";

/**
 * Marks a class as middleware. Implies `@Injectable()`.
 *
 * The class must implement `ElysiaNestMiddleware`:
 * ```typescript
 * @Middleware()
 * export class LoggerMiddleware implements ElysiaNestMiddleware {
 *   async use(ctx: ElysiaContext, next: () => Promise<void>) {
 *     console.log(`--> ${ctx.request.method} ${ctx.path}`);
 *     await next(); // code here runs AFTER the route handler
 *     console.log(`<-- ${ctx.set.status}`);
 *   }
 * }
 * ```
 *
 * Register it in a module:
 * ```typescript
 * @Module({ middlewares: [LoggerMiddleware] })
 * export class AppModule {}
 * ```
 */
export function Middleware(options?: InjectableOptions): ClassDecorator {
  return (target) => {
    Injectable(options)(target);
  };
}
