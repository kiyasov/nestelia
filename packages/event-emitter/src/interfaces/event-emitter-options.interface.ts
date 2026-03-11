/**
 * Options for configuring the EventEmitterModule.
 *
 */
export interface EventEmitterModuleOptions {
  /**
   * Enable wildcard matching for event names.
   *
   * When `true`, `*` matches any single segment and `**` matches any
   * number of segments:
   * - `"order.*"` matches `"order.created"`, `"order.shipped"`, etc.
   * - `"**"` matches every event.
   *
   * @default false
   */
  wildcard?: boolean;

  /**
   * Delimiter used to separate namespaces in event names.
   *
   * @default "."
   */
  delimiter?: string;

  /**
   * Maximum number of listeners per event before a warning is emitted.
   *
   * @default 10
   */
  maxListeners?: number;

  /**
   * If `true`, registers `EventEmitterModule` as a global module so
   * `EventEmitterService` is available throughout the application without
   * re-importing the module.
   *
   * @default false
   */
  global?: boolean;
}

/**
 * Metadata stored per `@OnEvent` decorated method.
 *
 * @internal
 */
export interface OnEventMetadata {
  /** Event name or pattern. */
  event: string | symbol;
  /** Method name on the class. */
  methodName: string | symbol;
  /** Whether the handler should fire only once. */
  once: boolean;
}
