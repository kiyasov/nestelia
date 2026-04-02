import "reflect-metadata";

import { afterEach, describe, expect, it } from "bun:test";

import { EventEmitterService } from "../../src/event-emitter.service";

/**
 * Memory leak test: EventEmitterService handlers array.
 *
 * Issues documented:
 * 1. Handlers registered via on() persist forever unless off() is called
 * 2. No lifecycle hook to clear handlers on app shutdown
 * 3. maxListeners only warns, doesn't prevent accumulation
 * 4. removeAllListeners() exists but is never called automatically
 */
describe("EventEmitterService — memory leak", () => {
  let emitter: EventEmitterService;

  afterEach(() => {
    emitter?.removeAllListeners();
  });

  it("should accumulate handlers beyond maxListeners (only warns)", () => {
    emitter = new EventEmitterService({ maxListeners: 5 });

    // Register more handlers than maxListeners — only logs a warning
    for (let i = 0; i < 20; i++) {
      emitter.on("test.event", () => {});
    }

    expect(emitter.listenerCount("test.event")).toBe(20);
  });

  it("should retain handler closures and their captured scope", () => {
    emitter = new EventEmitterService();

    const captured: object[] = [];

    for (let i = 0; i < 100; i++) {
      // Each handler captures a large object in its closure
      const largeObject = { data: new Array(100).fill(`item-${i}`) };
      captured.push(largeObject);
      emitter.on("data.event", () => {
        // Reference largeObject to prevent it from being optimized away
        return largeObject.data.length;
      });
    }

    expect(emitter.listenerCount("data.event")).toBe(100);

    // All 100 large objects are retained via handler closures
    // They can only be freed by calling off() or removeAllListeners()
  });

  it("should properly clean up with removeAllListeners()", () => {
    emitter = new EventEmitterService();

    for (let i = 0; i < 100; i++) {
      emitter.on(`event.${i}`, () => {});
    }

    // Total handlers across all events
    let totalBefore = 0;
    for (let i = 0; i < 100; i++) {
      totalBefore += emitter.listenerCount(`event.${i}`);
    }
    expect(totalBefore).toBe(100);

    emitter.removeAllListeners();

    let totalAfter = 0;
    for (let i = 0; i < 100; i++) {
      totalAfter += emitter.listenerCount(`event.${i}`);
    }
    expect(totalAfter).toBe(0);
  });

  it("should clean up per-event with removeAllListeners(event)", () => {
    emitter = new EventEmitterService();

    emitter.on("keep.event", () => {});
    emitter.on("remove.event", () => {});
    emitter.on("remove.event", () => {});

    emitter.removeAllListeners("remove.event");

    expect(emitter.listenerCount("keep.event")).toBe(1);
    expect(emitter.listenerCount("remove.event")).toBe(0);
  });

  it("should demonstrate once() handlers are properly cleaned after emit", () => {
    emitter = new EventEmitterService();

    let count = 0;
    for (let i = 0; i < 50; i++) {
      emitter.once("one-time", () => {
        count++;
      });
    }

    expect(emitter.listenerCount("one-time")).toBe(50);

    emitter.emit("one-time");

    // All once handlers should be removed after emit
    expect(emitter.listenerCount("one-time")).toBe(0);
    expect(count).toBe(50);
  });
});
