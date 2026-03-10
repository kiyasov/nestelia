import "reflect-metadata";

import { describe, expect, it, beforeEach } from "bun:test";

import { EventEmitter2 } from "../src/event-emitter.service";

describe("EventEmitter2 — basic", () => {
  let emitter: EventEmitter2;

  beforeEach(() => {
    emitter = new EventEmitter2();
  });

  it("emits to registered handler", async () => {
    let received: unknown;
    emitter.on("test", (p) => { received = p; });
    await emitter.emitAsync("test", { id: 1 });
    expect(received).toEqual({ id: 1 });
  });

  it("emit() returns true when handlers exist", () => {
    emitter.on("test", () => {});
    expect(emitter.emit("test")).toBe(true);
  });

  it("emit() returns false with no handlers", () => {
    expect(emitter.emit("noop")).toBe(false);
  });

  it("emitAsync() returns array of handler results", async () => {
    emitter.on<number>("test", async (n) => n! * 2);
    emitter.on<number>("test", async (n) => n! + 10);
    const results = await emitter.emitAsync("test", 5);
    expect(results).toEqual([10, 15]);
  });

  it("calls multiple handlers", async () => {
    const calls: number[] = [];
    emitter.on("test", () => calls.push(1));
    emitter.on("test", () => calls.push(2));
    await emitter.emitAsync("test", null);
    expect(calls).toEqual([1, 2]);
  });

  it("once() fires only once", async () => {
    let count = 0;
    emitter.once("test", () => count++);
    await emitter.emitAsync("test", null);
    await emitter.emitAsync("test", null);
    expect(count).toBe(1);
  });

  it("off() removes specific handler", async () => {
    let count = 0;
    const handler = () => count++;
    emitter.on("test", handler);
    emitter.off("test", handler);
    await emitter.emitAsync("test", null);
    expect(count).toBe(0);
  });

  it("off() without handler removes all for event", async () => {
    let count = 0;
    emitter.on("test", () => count++);
    emitter.on("test", () => count++);
    emitter.off("test");
    await emitter.emitAsync("test", null);
    expect(count).toBe(0);
  });

  it("removeAllListeners() clears everything", async () => {
    let count = 0;
    emitter.on("a", () => count++);
    emitter.on("b", () => count++);
    emitter.removeAllListeners();
    await emitter.emitAsync("a", null);
    await emitter.emitAsync("b", null);
    expect(count).toBe(0);
  });

  it("listenerCount() returns correct count", () => {
    emitter.on("test", () => {});
    emitter.on("test", () => {});
    expect(emitter.listenerCount("test")).toBe(2);
  });

  it("supports symbol events", async () => {
    const SYM = Symbol("sym");
    let received: unknown;
    emitter.on(SYM, (p) => { received = p; });
    await emitter.emitAsync(SYM, "hello");
    expect(received).toBe("hello");
  });

  it("continues after handler throws", async () => {
    let secondCalled = false;
    emitter.on("test", () => { throw new Error("boom"); });
    emitter.on("test", () => { secondCalled = true; });
    await emitter.emitAsync("test", null);
    expect(secondCalled).toBe(true);
  });
});

describe("EventEmitter2 — wildcard", () => {
  let emitter: EventEmitter2;

  beforeEach(() => {
    emitter = new EventEmitter2({ wildcard: true });
  });

  it("'*' matches any single segment", async () => {
    const events: string[] = [];
    emitter.on("order.*", (e) => events.push(e as string));
    await emitter.emitAsync("order.created", "created");
    await emitter.emitAsync("order.shipped", "shipped");
    await emitter.emitAsync("user.created", "user");  // should NOT match
    expect(events).toEqual(["created", "shipped"]);
  });

  it("'**' matches everything", async () => {
    let count = 0;
    emitter.on("**", () => count++);
    await emitter.emitAsync("order.created", null);
    await emitter.emitAsync("user.deleted", null);
    await emitter.emitAsync("foo", null);
    expect(count).toBe(3);
  });

  it("exact match still works with wildcard mode on", async () => {
    let called = false;
    emitter.on("order.created", () => { called = true; });
    await emitter.emitAsync("order.created", null);
    expect(called).toBe(true);
  });

  it("'*' does NOT match multi-segment events", async () => {
    let count = 0;
    emitter.on("order.*", () => count++);
    await emitter.emitAsync("order.sub.event", null);
    expect(count).toBe(0);
  });

  it("custom delimiter", async () => {
    const e2 = new EventEmitter2({ wildcard: true, delimiter: ":" });
    let called = false;
    e2.on("order:*", () => { called = true; });
    await e2.emitAsync("order:created", null);
    expect(called).toBe(true);
  });
});
