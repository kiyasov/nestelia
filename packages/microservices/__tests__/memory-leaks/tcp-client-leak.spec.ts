import { describe, expect, it } from "bun:test";

import { TcpClient } from "../../src/client/tcp.client";

/**
 * Memory leak test: TcpClient now removes socket listeners before destroying.
 */
describe("TcpClient — memory leak fix", () => {
  it("should not throw on close() without connect()", () => {
    const client = new TcpClient({ host: "localhost", port: 19999 });

    client.close();

    expect(() => client.close()).not.toThrow();
  });

  it("should clear pending requests on close()", () => {
    const client = new TcpClient({ host: "localhost", port: 19999 });

    const pending = (client as any).pendingRequests as Map<string, unknown>;
    pending.set("test-id", () => {});

    expect(pending.size).toBe(1);

    client.close();

    expect(pending.size).toBe(0);
  });

  it("should clear buffer on close()", () => {
    const client = new TcpClient({ host: "localhost", port: 19999 });

    (client as any).buffer = '{"partial": true';

    client.close();

    expect((client as any).buffer).toBe("");
  });

  it("should remove socket listeners on close()", () => {
    const client = new TcpClient({ host: "localhost", port: 19999 });

    // Simulate a socket with listeners
    const { EventEmitter } = require("events");
    const fakeSocket = new EventEmitter();
    fakeSocket.destroy = () => {};
    (client as any).socket = fakeSocket;

    fakeSocket.on("data", () => {});
    fakeSocket.on("error", () => {});
    fakeSocket.on("close", () => {});

    expect(fakeSocket.listenerCount("data")).toBe(1);
    expect(fakeSocket.listenerCount("error")).toBe(1);
    expect(fakeSocket.listenerCount("close")).toBe(1);

    client.close();

    expect(fakeSocket.listenerCount("data")).toBe(0);
    expect(fakeSocket.listenerCount("error")).toBe(0);
    expect(fakeSocket.listenerCount("close")).toBe(0);
  });
});
