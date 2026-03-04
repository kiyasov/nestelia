/**
 * Context type key for RabbitMQ execution contexts
 * Used for interceptors, guards, and filters
 */
export const RABBIT_CONTEXT_TYPE_KEY = "rmq";

/**
 * Check if the current execution context is a RabbitMQ context
 * Useful for guards and interceptors that need to handle RabbitMQ differently
 *
 * @param contextType The context type from ExecutionContext
 * @returns true if the context is RabbitMQ
 *
 * @example
 * ```typescript
 * @Injectable()
 * class MyGuard implements CanActivate {
 *   canActivate(context: ExecutionContext): boolean {
 *     if (isRabbitContext(context.getType())) {
 *       // Handle RabbitMQ context
 *       return true;
 *     }
 *     // Handle HTTP/WS context
 *     return true;
 *   }
 * }
 * ```
 */
export function isRabbitContext(contextType: string): boolean {
  return contextType === RABBIT_CONTEXT_TYPE_KEY;
}
