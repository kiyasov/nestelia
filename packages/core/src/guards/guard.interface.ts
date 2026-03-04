import type { ExecutionContext } from "../interfaces";

/**
 * @deprecated Use ExecutionContext from "../interfaces" instead
 */
export type GuardContext = ExecutionContext;

/**
 * Interface for guards
 */
export interface CanActivate {
  /**
   * Method to determine if a request should proceed
   * @param context The execution context
   */
  canActivate(context: ExecutionContext): Promise<boolean> | boolean;
}
