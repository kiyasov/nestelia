import type { Observable } from "rxjs";

import type { ExecutionContext } from "../interfaces";

/**
 * Interface for request interceptors
 */
export interface Interceptor {
  /**
   * Method to intercept incoming requests
   * @param context The request context
   */
  intercept(context: any): Promise<boolean | void> | boolean | void;
}

/**
 * Interface for response interceptors
 */
export interface ResponseInterceptor {
  /**
   * Method to intercept outgoing responses
   * @param context The response context
   */
  interceptAfter(context: any): Promise<any> | any;
}

/**
 * Call handler interface for interceptors
 *
 */
export interface CallHandler<T = any> {
  /**
   * Returns an Observable representing the response stream
   */
  handle(): Observable<T>;
}

/**
 * Elysia-Nest interceptor interface
 *
 */
export interface NestInterceptor<T = any, R = any> {
  /**
   * Intercept the request/response stream
   * @param context The execution context
   * @param next The call handler
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<R> | Promise<Observable<R>>;
}
