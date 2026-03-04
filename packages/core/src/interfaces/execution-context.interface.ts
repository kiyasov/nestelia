/**
 * HTTP context interface for request/response access
 *
 * @publicApi
 */
export interface HttpArgumentsHost {
  getRequest<T = any>(): T;
  getResponse<T = any>(): T;
  getNext<T = any>(): T;
}

/**
 * RPC context interface
 *
 * @publicApi
 */
export interface RpcArgumentsHost {
  getData<T = any>(): T;
  getContext<T = any>(): T;
}

/**
 * WebSocket context interface
 *
 * @publicApi
 */
export interface WsArgumentsHost {
  getData<T = any>(): T;
  getClient<T = any>(): T;
  getPattern<T = any>(): T;
}

/**
 * Execution context interface providing access to
 * the request/response and handler information
 *
 * @publicApi
 */
export interface ExecutionContext {
  /**
   * Returns the class of the current handler
   */
  getClass<T = any>(): T;

  /**
   * Returns the handler function
   */
  getHandler(): (...args: unknown[]) => unknown;

  /**
   * Get argument by index
   */
  getArgByIndex<T = any>(index: number): T;

  /**
   * Get all arguments
   */
  getArgs<T extends Array<any> = any[]>(): T;

  /**
   * Get type of the context
   */
  getType<TContext extends string = string>(): TContext;

  /**
   * Switch to HTTP context
   */
  switchToHttp(): HttpArgumentsHost;

  /**
   * Switch to RPC context
   */
  switchToRpc(): RpcArgumentsHost;

  /**
   * Switch to WebSocket context
   */
  switchToWs(): WsArgumentsHost;
}
