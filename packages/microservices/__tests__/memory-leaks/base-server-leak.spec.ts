import { describe, expect, it } from "bun:test";

import { BaseServer } from "../../src/transports/server";

/**
 * Memory leak test: BaseServer cleanup() properly clears handlers and listeners.
 */

// Concrete implementation for testing
class TestServer extends BaseServer {
  public isOpen = true;

  listen(callback?: (err?: unknown) => void): void {
    callback?.();
  }

  async sendMessage<T>(pattern: string, data: T): Promise<unknown> {
    return null;
  }

  emitEvent<T>(pattern: string, data: T): void {}

  close(): void {
    this.isOpen = false;
    this.cleanup();
  }
}

describe("BaseServer — memory leak fix", () => {
  it("should clear message handlers on close()", () => {
    const server = new TestServer();

    for (let i = 0; i < 100; i++) {
      server.addMessageHandler(`pattern.${i}`, async () => `response-${i}`);
    }

    server.close();

    const handlers = (server as any).messageHandlers as Map<string, unknown>;
    expect(handlers.size).toBe(0);
  });

  it("should clear event handlers on close()", () => {
    const server = new TestServer();

    for (let i = 0; i < 50; i++) {
      server.addEventHandler(`event.${i}`, async () => {});
    }

    server.close();

    const handlers = (server as any).eventHandlers as Map<string, unknown>;
    expect(handlers.size).toBe(0);
  });

  it("should remove EventEmitter listeners on close()", () => {
    const server = new TestServer();

    server.on("ready", () => {});
    server.on("error", () => {});
    server.on("ready", () => {});

    expect(server.listenerCount("ready")).toBe(2);
    expect(server.listenerCount("error")).toBe(1);

    server.close();

    expect(server.listenerCount("ready")).toBe(0);
    expect(server.listenerCount("error")).toBe(0);
  });
});
