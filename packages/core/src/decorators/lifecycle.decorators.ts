import "reflect-metadata";

import { ELYSIA_HOOKS_METADATA } from "./constants";

/**
 * Type for Elysia lifecycle hook names
 */
export type ElysiaHookName =
  | "onRequest"
  | "onParse"
  | "onTransform"
  | "onBeforeHandle"
  | "onAfterHandle"
  | "onMapResponse"
  | "onAfterResponse"
  | "onError";

/**
 * Metadata for Elysia lifecycle hooks
 */
export interface ElysiaHookMetadata {
  hook: ElysiaHookName;
  method: string | symbol;
  options?: {
    /** Insert before other hooks */
    before?: boolean;
  };
}

/**
 * Creates a decorator for an Elysia lifecycle hook
 */
function createHookDecorator(hook: ElysiaHookName) {
  return function (options?: ElysiaHookMetadata["options"]): MethodDecorator {
    return function (
      target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor,
    ) {
      const existingHooks: ElysiaHookMetadata[] =
        Reflect.getMetadata(ELYSIA_HOOKS_METADATA, target.constructor) || [];

      existingHooks.push({
        hook,
        method: propertyKey,
        options,
      });

      Reflect.defineMetadata(
        ELYSIA_HOOKS_METADATA,
        existingHooks,
        target.constructor,
      );

      return descriptor;
    };
  };
}

/**
 * Hook called when new request is received
 * @see https://elysiajs.com/essential/life-cycle.html#on-request
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnRequest()
 *   async logRequest(context: Context) {
 *     console.log(`Request: ${context.request.method} ${context.path}`);
 *   }
 * }
 * ```
 */
export const OnRequest = createHookDecorator("onRequest");

/**
 * Hook called to parse request body
 * @see https://elysiajs.com/essential/life-cycle.html#on-parse
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnParse()
 *   async customParser(context: Context) {
 *     const contentType = context.request.headers.get('content-type');
 *     if (contentType === 'application/custom') {
 *       return await context.request.text();
 *     }
 *   }
 * }
 * ```
 */
export const OnParse = createHookDecorator("onParse");

/**
 * Hook called to transform parsed body
 * @see https://elysiajs.com/essential/life-cycle.html#on-transform
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnTransform()
 *   async transformBody(context: Context) {
 *     if (context.body && typeof context.body === 'object') {
 *       context.body.transformed = true;
 *     }
 *   }
 * }
 * ```
 */
export const OnTransform = createHookDecorator("onTransform");

/**
 * Hook called before request handler
 * @see https://elysiajs.com/essential/life-cycle.html#on-before-handle
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnBeforeHandle()
 *   async checkAuth(context: Context) {
 *     if (!context.headers.authorization) {
 *       context.set.status = 401;
 *       return { error: 'Unauthorized' };
 *     }
 *   }
 * }
 * ```
 */
export const OnBeforeHandle = createHookDecorator("onBeforeHandle");

/**
 * Hook called after request handler
 * @see https://elysiajs.com/essential/life-cycle.html#on-after-handle
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnAfterHandle()
 *   async modifyResponse(context: Context) {
 *     if (context.response && typeof context.response === 'object') {
 *       context.response.timestamp = new Date().toISOString();
 *     }
 *   }
 * }
 * ```
 */
export const OnAfterHandle = createHookDecorator("onAfterHandle");

/**
 * Hook called to map response
 * @see https://elysiajs.com/essential/life-cycle.html#on-map-response
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnMapResponse()
 *   async formatResponse(context: Context) {
 *     return new Response(JSON.stringify(context.response), {
 *       headers: { 'Content-Type': 'application/json' }
 *     });
 *   }
 * }
 * ```
 */
export const OnMapResponse = createHookDecorator("onMapResponse");

/**
 * Hook called after response is sent
 * @see https://elysiajs.com/essential/life-cycle.html#on-after-response
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnAfterResponse()
 *   async logResponse(context: Context) {
 *     console.log(`Response sent: ${context.set.status}`);
 *   }
 * }
 * ```
 */
export const OnAfterResponse = createHookDecorator("onAfterResponse");

/**
 * Hook called when error occurs
 * @see https://elysiajs.com/essential/life-cycle.html#on-error
 *
 * @example
 * ```typescript
 * @Controller('/users')
 * export class UserController {
 *   @OnError()
 *   async handleError({ error, set }: Context) {
 *     console.error('Error occurred:', error);
 *     set.status = 500;
 *     return { error: 'Internal Server Error' };
 *   }
 * }
 * ```
 */
export const OnError = createHookDecorator("onError");

/**
 * Get all Elysia lifecycle hooks metadata for a controller
 */
export function getElysiaHooksMetadata(target: object): ElysiaHookMetadata[] {
  return Reflect.getMetadata(ELYSIA_HOOKS_METADATA, target) || [];
}
