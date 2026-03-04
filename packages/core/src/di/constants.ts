export interface ContextId {
  readonly id: string | symbol | number;
  payload?: unknown;
}

export const STATIC_CONTEXT_ID = 1;
export const STATIC_CONTEXT: ContextId = Object.freeze({
  id: STATIC_CONTEXT_ID,
});

export const CONTROLLER_ID_KEY = Symbol("CONTROLLER_ID");

/**
 * Injection token for exception filters
 * Use this token to provide a global exception filter
 * @example
 * ```typescript
 * {
 *   provide: APP_FILTER,
 *   useClass: HttpExceptionFilter
 * }
 * ```
 */
export const APP_FILTER = Symbol("APP_FILTER");
