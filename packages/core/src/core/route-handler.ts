/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomUUID } from "node:crypto";

import type { Context as ElysiaContextType } from "elysia";

import { GUARDS_METADATA, INTERCEPTORS_METADATA, PARAMS_METADATA } from "../decorators/constants";
import {
  PARAMS_METADATA as FILE_PARAMS_METADATA,
  processParameters,
} from "../decorators/param.decorators";
import { HEADERS_METADATA } from "../decorators/header.decorator";
import { HTTP_CODE_METADATA } from "../decorators/http-code.decorator";
import type { ParamMetadata } from "../decorators/types";
import { Container, DIContainer, type Type } from "../di";
import type { ExecutionContext } from "../interfaces/execution-context.interface";
import { Logger } from "../logger/logger.service";
import { resolveParam } from "./param-resolver";

/**
 * Builds an HTTP ExecutionContext for the given Elysia request context.
 */
function buildHttpExecutionContext(
  controllerClass: Type,
  handlerMethodName: string,
  controllerInstance: object,
  elysiaContext: ElysiaContextType,
): ExecutionContext {
  return {
    getClass: <T = any>() => controllerClass as unknown as T,
    getHandler: () =>
      (controllerInstance as Record<string, (...args: unknown[]) => unknown>)[handlerMethodName] ??
      (() => undefined),
    getArgs: <T extends Array<any> = any[]>() => [elysiaContext] as unknown as T,
    getArgByIndex: <T = any>(index: number) => ([elysiaContext] as any)[index] as T,
    getType: <TContext extends string = string>() => "http" as unknown as TContext,
    switchToHttp: () => ({
      getRequest: <T = any>() => elysiaContext.request as unknown as T,
      getResponse: <T = any>() => elysiaContext as unknown as T,
      getNext: <T = any>() => undefined as unknown as T,
    }),
    switchToRpc: () => ({
      getData: <T = any>() => undefined as unknown as T,
      getContext: <T = any>() => undefined as unknown as T,
    }),
    switchToWs: () => ({
      getData: <T = any>() => undefined as unknown as T,
      getClient: <T = any>() => undefined as unknown as T,
      getPattern: <T = any>() => undefined as unknown as T,
    }),
  };
}

/**
 * Runs all guards (class-level then method-level) for the given route.
 * Returns a 403 response object if any guard denies access, otherwise undefined.
 */
async function runGuards(
  controllerClass: Type,
  handlerMethodName: string,
  controllerInstance: object,
  moduleinstance: any,
  elysiaContext: ElysiaContextType,
): Promise<{ statusCode: 403; error: string; message: string } | undefined> {
  const classGuards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, controllerClass) ?? [];
  const methodGuards: unknown[] =
    Reflect.getMetadata(GUARDS_METADATA, controllerClass, handlerMethodName) ?? [];
  const guards = [...classGuards, ...methodGuards];

  if (guards.length === 0) return undefined;

  const executionContext = buildHttpExecutionContext(
    controllerClass,
    handlerMethodName,
    controllerInstance,
    elysiaContext,
  );

  for (const guardToken of guards) {
    let guard: any;
    if (typeof guardToken === "function") {
      const fromDI = await DIContainer.get(guardToken as Type, moduleinstance as Type);
      guard = fromDI ?? new (guardToken as any)();
    } else {
      guard = guardToken;
    }

    if (typeof guard?.canActivate === "function") {
      const allowed = await guard.canActivate(executionContext);
      if (!allowed) {
        elysiaContext.set.status = 403;
        return { statusCode: 403, error: "Forbidden", message: "Forbidden" };
      }
    }
  }

  return undefined;
}

/**
 * Creates an Elysia route handler for a controller method.
 * Pipeline: resolve controller → run guards → run interceptors → resolve params → call handler → apply status/headers.
 */
export function createRouteHandler(
  controllerClass: Type,
  handlerMethodName: string,
  moduleinstance: any,
): (ctx: ElysiaContextType) => Promise<any> {
  return async (elysiaContext: ElysiaContextType) =>
    Container.runInRequestContext({ id: randomUUID(), container: new Map() }, async () => {
      const controllerInstance = await DIContainer.get(
        controllerClass,
        moduleinstance as Type<any>,
      );

      if (!controllerInstance) {
        Logger.error(`Failed to resolve controller ${controllerClass.name}`);
        elysiaContext.set.status = 500;
        return { error: "Internal server error" };
      }

      const originalMethod = (
        controllerInstance as Record<string, (...args: unknown[]) => unknown>
      )[handlerMethodName];

      if (typeof originalMethod !== "function") {
        Logger.error(`Handler method ${handlerMethodName} not found on ${controllerClass.name}`);
        elysiaContext.set.status = 500;
        return { error: "Internal server error" };
      }

      // Guards
      const denied = await runGuards(
        controllerClass,
        handlerMethodName,
        controllerInstance,
        moduleinstance,
        elysiaContext,
      );
      if (denied) return denied;

      // Interceptors
      const interceptors: any[] =
        Reflect.getMetadata(INTERCEPTORS_METADATA, controllerClass, handlerMethodName) || [];

      for (const InterceptorClass of interceptors) {
        const interceptor =
          typeof InterceptorClass === "function" ? new InterceptorClass() : InterceptorClass;
        if (typeof interceptor.intercept === "function") {
          await interceptor.intercept(elysiaContext);
        }
      }

      // Parameters
      const paramDefinitions: ParamMetadata[] =
        Reflect.getMetadata(PARAMS_METADATA, controllerClass, handlerMethodName) || [];

      const paramTypes: any[] =
        Reflect.getMetadata("design:paramtypes", controllerInstance, handlerMethodName) || [];

      const resolvedParams = await Promise.all(
        paramTypes.map(async (paramType: any, index: number) => {
          const paramMeta = paramDefinitions.find((p) => p.index === index);
          try {
            return await resolveParam(
              paramMeta,
              paramType,
              elysiaContext,
              moduleinstance as Type<any>,
            );
          } catch {
            return undefined;
          }
        }),
      );

      // Overlay file/form params from @File/@Files/@Form decorators
      const fileParamDefs: Array<{ index: number }> =
        Reflect.getMetadata(FILE_PARAMS_METADATA, controllerClass, handlerMethodName) || [];
      if (fileParamDefs.length > 0) {
        const fileResolvedParams = await processParameters(
          elysiaContext as any,
          controllerClass,
          handlerMethodName,
        );
        for (const { index } of fileParamDefs) {
          resolvedParams[index] = fileResolvedParams[index];
        }
      }

      const result = await originalMethod.apply(controllerInstance, resolvedParams);

      // HTTP status code
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, controllerClass, handlerMethodName);
      if (httpCode) {
        elysiaContext.set.status = httpCode;
      }

      // HTTP headers
      const headers: Array<{ name: string; value: string }> =
        Reflect.getMetadata(HEADERS_METADATA, controllerClass, handlerMethodName) || [];
      for (const { name, value } of headers) {
        elysiaContext.set.headers[name] = value;
      }

      return result;
    });
}
