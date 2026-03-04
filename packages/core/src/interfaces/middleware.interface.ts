import type {
  Context as ElysiaContext,
  Handler as ElysiaHandler,
} from "elysia";

import { Type } from "../di"; // For class-based middleware type

/**
 * Interface for class-based middleware.
 * Instances will be resolved from the DI container.
 */
export interface ElysiaNestMiddleware {
  use(context: ElysiaContext, next: () => Promise<any>): Promise<any> | any;
}

/**
 * Functional middleware type.
 * Directly an Elysia handler or a similar function.
 */
export type FunctionalMiddleware = ElysiaHandler;
// Potentially expand to allow (context, next) -> void for simpler middleware
// export type FunctionalMiddleware =
//   | ElysiaHandler
//   | ((context: ElysiaContext, next: () => Promise<void>) => Promise<void> | void);

/**
 * Represents either a class type that implements ElysiaNestMiddleware
 * or a functional middleware.
 */
export type MiddlewareType = Type<ElysiaNestMiddleware> | FunctionalMiddleware;

// Type guard to check if a middleware is class-based
export function isClassMiddleware(
  middleware: MiddlewareType,
): middleware is Type<ElysiaNestMiddleware> {
  return (
    typeof middleware === "function" &&
    !!middleware.prototype &&
    !!middleware.prototype.use
  );
}
