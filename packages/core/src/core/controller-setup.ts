/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Context as ElysiaContextType, Elysia } from "elysia";

import {
  ELYSIA_HOOKS_METADATA,
  PARAMS_METADATA,
  ROUTE_METADATA,
  ROUTE_PREFIX_METADATA,
  ROUTE_SCHEMA_METADATA,
} from "../decorators/constants";
import type { ElysiaHookMetadata } from "../decorators/lifecycle.decorators";
import type { ParamMetadata, RouteMetadata } from "../decorators/types";
import { DIContainer, type Type } from "../di";
import type { ElysiaNestMiddleware } from "../interfaces/middleware.interface";
import { Logger } from "../logger/logger.service";
import { applyExceptionFilters } from "./exception-filter.registry";
import { createRouteHandler } from "./route-handler";

/**
 * Wraps a route handler with a chain of class-based middlewares.
 * Each middleware's `use(ctx, next)` fully wraps the inner handler —
 * code before `await next()` runs before the handler,
 * code after runs after it.
 */
export function wrapWithMiddleware(
  handler: (ctx: ElysiaContextType) => Promise<unknown>,
  middlewares: ElysiaNestMiddleware[],
): (ctx: ElysiaContextType) => Promise<unknown> {
  return (ctx: ElysiaContextType) => {
    const dispatch = (i: number): Promise<unknown> => {
      if (i === middlewares.length) return handler(ctx);
      return Promise.resolve(middlewares[i].use(ctx, () => dispatch(i + 1) as Promise<void>));
    };
    return dispatch(0);
  };
}

/**
 * Registers all routes for a controller on the Elysia app instance.
 */
export async function setupController(
  app: Elysia,
  controllerClass: Type,
  moduleinstance: any,
  _prefix: string,
  middlewares: ElysiaNestMiddleware[] = [],
): Promise<void> {
  const controllerMeta = Reflect.getMetadata(ROUTE_PREFIX_METADATA, controllerClass);
  const controllerPrefix =
    (typeof controllerMeta === "string" ? controllerMeta : controllerMeta?.prefix) || "";
  const routes: RouteMetadata[] = Reflect.getMetadata(ROUTE_METADATA, controllerClass) || [];

  const routesLogger = new Logger("RoutesResolver");
  const routerExplorerLogger = new Logger("RouterExplorer");

  for (const route of routes) {
    const fullPath = `${controllerPrefix}${
      route.path.startsWith("/") || controllerPrefix.endsWith("/") ? "" : "/"
    }${route.path}`;

    const baseHandler = createRouteHandler(controllerClass, route.propertyKey, moduleinstance);
    const elysiaHandler =
      middlewares.length > 0 ? wrapWithMiddleware(baseHandler, middlewares) : baseHandler;

    const decoratorSchema =
      Reflect.getMetadata(ROUTE_SCHEMA_METADATA, controllerClass, route.propertyKey) || {};

    const paramDefinitions: ParamMetadata[] =
      Reflect.getMetadata(PARAMS_METADATA, controllerClass, route.propertyKey) || [];

    const paramSchemas: Record<string, unknown> = {};
    for (const param of paramDefinitions) {
      if (param.schema) {
        const schemaKey = param.type === "param" ? "params" : param.type;
        paramSchemas[schemaKey] = param.schema;
      }
    }

    // If any parameter uses @RawBody(), tell Elysia to deliver the body as plain text
    // instead of parsing it as JSON. This is required for webhook signature verification.
    const hasRawBody = paramDefinitions.some((p) => p.type === "raw-body");

    const schemaOptions: Record<string, unknown> = {
      ...(hasRawBody ? { type: "text" } : {}),
      ...paramSchemas,
      ...decoratorSchema,
      error: applyExceptionFilters,
    };

    const method = route.method.toUpperCase();
    const routePath = fullPath.replace(/\/$/, "");

    routerExplorerLogger.log(`Mapped {${routePath}, ${method}} route`);

    const methodLower = method.toLowerCase();

    if (methodLower === "all") {
      if (typeof (app as any).all === "function") {
        app = (app as any).all(routePath, elysiaHandler, schemaOptions) as any;
      } else {
        for (const m of ["get", "post", "put", "patch", "delete", "options", "head"]) {
          if (typeof (app as any)[m] === "function") {
            app = (app as any)[m](routePath, elysiaHandler, schemaOptions) as any;
          }
        }
      }
    } else if (typeof (app as any)[methodLower] === "function") {
      app = (app as any)[methodLower](routePath, elysiaHandler, schemaOptions) as any;
    } else {
      Logger.warn(`HTTP method ${method} not supported.`);
    }
  }

  routesLogger.log(`${controllerClass.name} {${controllerPrefix || "/"}}:`);

  await setupControllerHooks(app, controllerClass, moduleinstance, controllerPrefix);
}

/**
 * Registers Elysia lifecycle hooks declared on a controller via @OnBeforeHandle etc.
 */
async function setupControllerHooks(
  app: Elysia,
  controllerClass: Type,
  moduleinstance: any,
  controllerPrefix: string,
): Promise<void> {
  const hooksMetadata: ElysiaHookMetadata[] =
    Reflect.getMetadata(ELYSIA_HOOKS_METADATA, controllerClass) || [];

  if (!hooksMetadata.length) return;

  const controllerInstance = await DIContainer.get(controllerClass, moduleinstance as Type<any>);

  if (!controllerInstance) return;

  const hooksByType = new Map<string, ElysiaHookMetadata[]>();
  for (const hook of hooksMetadata) {
    const existing = hooksByType.get(hook.hook) || [];
    existing.push(hook);
    hooksByType.set(hook.hook, existing);
  }

  for (const [hookName, hooks] of hooksByType) {
    const handlers = hooks.map((h) => {
      const method = (controllerInstance as Record<string, (...args: unknown[]) => unknown>)[
        h.method as string
      ];
      return method.bind(controllerInstance);
    });

    if (typeof (app as any)[hookName] === "function") {
      const scopedApp = new Elysia({ prefix: controllerPrefix });
      for (const handler of handlers) {
        (scopedApp as any)[hookName](handler);
      }
      app = app.use(scopedApp) as any;
    }
  }
}
