import { randomUUID } from "node:crypto";
import { createConnection, type Socket } from "net";

import { Observable, type Observer } from "rxjs";

import type { TcpOptions } from "../interfaces";
import { ClientProxy } from "./client-proxy";

/** Maximum number of bytes buffered from the server before the connection is closed. */
const MAX_BUFFER_SIZE = 1_048_576; // 1 MiB

interface TcpResponse {
  id: string;
  data?: unknown;
  error?: string;
}

/**
 * Client proxy that communicates over raw TCP with newline-delimited JSON
 * framing.
 *
 * - {@link send}: writes `{ id, pattern, data }\n` and waits for `{ id, data }\n`.
 * - {@link emit}: writes `{ id, pattern, data }\n` without waiting for a reply.
 */
export class TcpClient extends ClientProxy {
  private socket?: Socket;

  /** Pending request id → resolve callback. */
  private readonly pendingRequests = new Map<
    string,
    (response: TcpResponse) => void
  >();

  private isConnected = false;
  private buffer = "";

  constructor(private readonly options: TcpOptions) {
    super();
  }

  /** Opens a TCP connection to the configured host/port. */
  async connect(): Promise<void> {
    const host = this.options.host ?? "localhost";
    const port = this.options.port ?? 3000;

    return new Promise((resolve, reject) => {
      this.socket = createConnection({ host, port }, () => {
        this.isConnected = true;
        resolve();
      });

      this.socket.on("data", (chunk: Buffer) => this.handleData(chunk));

      this.socket.on("error", (err) => {
        if (!this.isConnected) {
          reject(err);
        }
      });

      this.socket.on("close", () => {
        this.isConnected = false;
      });
    });
  }

  private handleData(chunk: Buffer): void {
    this.buffer += chunk.toString();

    // Guard against unbounded buffer growth from a misbehaving server.
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      this.socket?.destroy(
        new Error(
          `TCP buffer overflow: response exceeded ${MAX_BUFFER_SIZE} bytes`,
        ),
      );
      this.buffer = "";
      return;
    }

    const lines = this.buffer.split("\n");
    this.buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line) as TcpResponse;
        if (response.id) {
          const resolve = this.pendingRequests.get(response.id);
          if (resolve) {
            resolve(response);
            this.pendingRequests.delete(response.id);
          }
        }
      } catch {
        // Discard malformed frames.
      }
    }
  }

  /**
   * Sends a request to `pattern` and returns an Observable that emits the
   * response then completes. Times out after **5 seconds**.
   */
  send<T = unknown, R = unknown>(pattern: string, data: T): Observable<R> {
    return new Observable((observer: Observer<R>) => {
      if (!this.isConnected || !this.socket) {
        observer.error(new Error("TCP client is not connected"));
        return;
      }

      const id = randomUUID();

      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        observer.error(new Error(`Request timeout for pattern: "${pattern}"`));
      }, 5_000);

      this.pendingRequests.set(id, (response: TcpResponse) => {
        clearTimeout(timer);
        if (response.error) {
          observer.error(new Error(response.error));
        } else {
          observer.next(response.data as R);
          observer.complete();
        }
      });

      this.socket.write(JSON.stringify({ id, pattern, data }) + "\n");
    });
  }

  /** Writes a fire-and-forget event to the server. */
  emit<T = unknown>(pattern: string, data: T): void {
    if (!this.isConnected || !this.socket) {
      throw new Error("TCP client is not connected");
    }
    this.socket.write(JSON.stringify({ id: randomUUID(), pattern, data }) + "\n");
  }

  /** Destroys the socket and clears pending requests. */
  close(): void {
    this.pendingRequests.clear();
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.destroy();
    }
    this.isConnected = false;
    this.buffer = "";
  }
}
