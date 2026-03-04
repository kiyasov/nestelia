import type { Observable } from "rxjs";

import type { Type } from "../../core/src/di";
import type {
  CustomTransportStrategy,
  MicroserviceOptions,
} from "./microservice.interface";

/**
 * Contract that every built-in transport server must satisfy.
 * Custom transports only need to implement {@link CustomTransportStrategy}.
 */
export interface Server {
  /** Register a handler for request-response messages matching `pattern`. */
  addHandler(pattern: string, callback: MessageHandler): void;
  /** Send a request and wait for the response. */
  sendMessage<T = unknown>(pattern: string, data: T): Promise<unknown>;
  /** Publish a fire-and-forget event. */
  emitEvent<T = unknown>(pattern: string, data: T): void;
  /** Shut down the transport and release all resources. */
  close(): void;
  /**
   * Start the transport server.
   * @param callback - Called when the server is ready or has failed.
   */
  listen(callback?: (err?: unknown) => void): void | Promise<void>;
}

/** Function signature for pattern handlers registered on a {@link Server}. */
export type MessageHandler<T = unknown, R = unknown> = (
  data: T,
  ctx: Record<string, unknown>,
) => Promise<R> | Observable<R> | R;

/** Factory interface for creating transport servers. */
export interface ServerFactoryInterface {
  create(options: MicroserviceOptions): Server | CustomTransportStrategy;
}

/** Metadata describing a registered pattern handler. */
export interface PatternHandler {
  pattern: string;
  handler: MessageHandler;
  target: Type;
  methodName: string;
  /** When `true`, this is a fire-and-forget event handler. */
  isEvent?: boolean;
}
