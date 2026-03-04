import type { Elysia } from "elysia";

import type { Type } from "../core/src/di";
import { ElysiaNestApplication } from "./elysia-nest-application";

/**
 * Creates a bare {@link ElysiaNestApplication} that wraps an already-configured
 * Elysia instance.
 *
 * **When to use this function:**
 * Use it only when you are **not** using the `@Module` decorator system.
 * If you do use modules, call `createElysiaApplication(AppModule)` from
 * `src/core/application.factory` instead – it handles DI, controllers,
 * providers, and lifecycle hooks automatically and returns an
 * `ElysiaNestApplication` ready to connect microservices.
 *
 * @param server - A pre-configured Elysia application. When omitted the
 *   instance can still host microservice transports; attach an HTTP server
 *   later via {@link ElysiaNestApplication.setHttpServer}.
 *
 * @example
 * ```typescript
 * // Typical module-based usage (preferred):
 * const app = await createElysiaApplication(AppModule); // from src/core
 * app.connectMicroservice({ transport: Transport.REDIS, options: {} });
 * await app.startAllMicroservices();
 * await app.listen(3000);
 *
 * // Direct (non-module) usage:
 * const elysiaApp = new Elysia().get('/health', () => 'ok');
 * const app = createElysiaNestApplication(elysiaApp);
 * app.connectMicroservice({ transport: Transport.TCP, options: { port: 4000 } });
 * await app.startAllMicroservices();
 * await app.listen(3000);
 * ```
 */
export function createElysiaNestApplication(
  server?: Elysia,
): ElysiaNestApplication {
  return new ElysiaNestApplication(server);
}

/**
 * Creates a new {@link ElysiaNestApplication} with a set of controllers
 * pre-registered for pattern handler scanning.
 *
 * Like {@link createElysiaNestApplication}, this bypasses the module system.
 * Prefer `createElysiaApplication(AppModule)` for module-based apps.
 *
 * @param server      - A pre-configured Elysia application.
 * @param controllers - Controller classes to scan for `@MessagePattern` and
 *   `@EventPattern` decorators.
 *
 * @example
 * ```typescript
 * const elysiaApp = new Elysia().get('/health', () => 'ok');
 * const app = createElysiaNestApplicationWithControllers(elysiaApp, [
 *   MathController,
 *   OrdersController,
 * ]);
 * app.connectMicroservice({ transport: Transport.REDIS, options: {} });
 * await app.startAllMicroservices();
 * await app.listen(3000);
 * ```
 */
export function createElysiaNestApplicationWithControllers(
  server: Elysia,
  controllers: Type[] = [],
): ElysiaNestApplication {
  const app = new ElysiaNestApplication(server);
  app.setControllers(controllers);
  return app;
}
