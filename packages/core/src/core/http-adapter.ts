import { Injectable } from "../di";

/**
 * Interface for HTTP adapter - abstracts HTTP server operations
 *
 */
export interface HttpAdapter {
  getRequestMethod(request: unknown): string;
  getRequestUrl(request: unknown): string;
  setHeader(response: unknown, name: string, value: string): void;
}

/**
 * Host class for accessing the HTTP adapter.
 * Used to abstract the underlying HTTP server.
 *
 */
@Injectable()
export class HttpAdapterHost {
  private _httpAdapter: HttpAdapter | undefined;

  /**
   * Get the HTTP adapter instance
   */
  get httpAdapter(): HttpAdapter | undefined {
    return this._httpAdapter;
  }

  /**
   * Set the HTTP adapter instance
   */
  set httpAdapter(adapter: HttpAdapter | undefined) {
    this._httpAdapter = adapter;
  }
}
