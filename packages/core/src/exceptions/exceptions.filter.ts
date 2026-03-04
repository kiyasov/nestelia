/**
 * Context for exception filters
 */
export interface ExceptionContext {
  request: any;
  response: any;
  set: any;
  path: string;
  method: string;
}

/**
 * Interface for exception filters
 */
export interface ExceptionFilter {
  /**
   * Method to catch and handle exceptions
   * @param exception The exception thrown
   * @param context The request context
   */
  catch(exception: Error, context: ExceptionContext): any;
}
