import type { Observable } from "rxjs";

/**
 * Abstract base class for all microservice client proxies.
 *
 * Concrete implementations are transport-specific and are created by
 * {@link ClientFactory}.  Use the {@link Client} decorator to inject a
 * proxy instance into a class property.
 */
export abstract class ClientProxy {
  /**
   * Opens the underlying transport connection.
   * Must be called before invoking {@link send} or {@link emit}.
   */
  abstract connect(): Promise<void>;

  /** Closes the transport connection and releases resources. */
  abstract close(): void;

  /**
   * Sends a request matching `pattern` and returns an Observable that emits
   * the server's response then completes.
   *
   * @param pattern - Target message pattern.
   * @param data    - Request payload.
   *
   * @example
   * ```typescript
   * this.client.send<number>('sum', [1, 2, 3]).subscribe(result => {
   *   console.log(result); // 6
   * });
   * ```
   */
  abstract send<T = unknown, R = unknown>(
    pattern: string,
    data: T,
  ): Observable<R>;

  /**
   * Publishes a fire-and-forget event matching `pattern`.
   *
   * @param pattern - Target event pattern.
   * @param data    - Event payload.
   */
  abstract emit<T = unknown>(pattern: string, data: T): void;
}
