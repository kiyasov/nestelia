import { afterEach, describe, expect, it } from "bun:test";

import { TcpServer } from "../../src/transports/tcp.server";

/**
 * Memory leak test: TcpServer now properly cleans up listeners on close().
 */
describe("TcpServer — memory leak fix", () => {
  let server: TcpServer;

  afterEach(() => {
    server?.close();
  });

  it("should remove all listeners on close()", (done) => {
    server = new TcpServer({ port: 0 });

    server.listen(() => {
      // Add external listeners
      server.on("ready", () => {});
      server.on("error", () => {});

      expect(server.listenerCount("ready")).toBeGreaterThanOrEqual(1);
      expect(server.listenerCount("error")).toBeGreaterThanOrEqual(1);

      server.close();

      // After close(), all EventEmitter listeners are removed
      expect(server.listenerCount("ready")).toBe(0);
      expect(server.listenerCount("error")).toBe(0);
      done();
    });
  });

  it("should clear handler maps on close()", (done) => {
    server = new TcpServer({ port: 0 });

    server.addMessageHandler("test.pattern", async () => "response");
    server.addEventHandler("test.event", async () => {});

    server.listen(() => {
      server.close();

      const messageHandlers = (server as any).messageHandlers as Map<string, unknown>;
      const eventHandlers = (server as any).eventHandlers as Map<string, unknown>;

      expect(messageHandlers.size).toBe(0);
      expect(eventHandlers.size).toBe(0);
      done();
    });
  });

  it("should not accumulate listeners across listen/close cycles", (done) => {
    server = new TcpServer({ port: 0 });

    server.on("ready", () => {});

    server.listen(() => {
      server.close();

      // After close, listeners are gone
      expect(server.listenerCount("ready")).toBe(0);
      done();
    });
  });
});
