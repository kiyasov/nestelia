/** An incoming request packet (request-response pattern). */
export interface IncomingRequest<T = unknown> {
  /** Unique request identifier used to correlate the response. */
  id: string;
  /** Pattern that identifies the handler on the server side. */
  pattern: string | Record<string, unknown>;
  /** Request payload. */
  data: T;
}

/** An outgoing response packet (request-response pattern). */
export interface OutgoingResponse<T = unknown> {
  /** Identifier matching the originating {@link IncomingRequest.id}. */
  id: string;
  /** Pattern echoed from the request. */
  pattern: string | Record<string, unknown>;
  /** Response payload. Undefined when `error` is set. */
  data?: T;
  /** Error message when the handler threw an exception. */
  error?: string;
  /** When `true`, the response stream is complete (no more messages). */
  isDisposed?: boolean;
}

/** An outgoing request packet sent by a {@link ClientProxy}. */
export interface OutgoingRequest<T = unknown> {
  /** Unique request identifier. */
  id: string;
  /** Target pattern. */
  pattern: string | Record<string, unknown>;
  /** Request payload. */
  data: T;
}

/** An incoming event packet (fire-and-forget pattern). */
export interface IncomingEvent<T = unknown> {
  /** Target pattern. */
  pattern: string | Record<string, unknown>;
  /** Event payload. */
  data: T;
}

/** Contextual information injected via the {@link MessageCtx} decorator. */
export interface MicroserviceContext {
  /** Pattern that matched this message. */
  pattern: string | Record<string, unknown>;
  /** Transport name (e.g. `"redis"`, `"tcp"`, `"rabbitmq"`). */
  transport: string;
  /** Returns the serialized pattern string. */
  getPattern: () => string;
  /** Returns the typed message payload. */
  getData: <T>() => T;
}
