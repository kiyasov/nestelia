import "reflect-metadata";

import { afterEach, describe, expect, it } from "bun:test";

import { EventEmitter } from "~/src/events/event-emitter";
import { getEventEmitter } from "~/src/events/event-emitter.container";

/**
 * Memory leak test: EventEmitter handlers cleanup via removeAllListeners.
 */
describe("EventEmitter — memory leak", () => {
  it("should accumulate handlers without bound on the global singleton", () => {
    const emitter = getEventEmitter();

    for (let i = 0; i < 100; i++) {
      emitter.on(`event.${i}`, () => {});
    }

    expect(() => {
      const size = (emitter as any).handlers.size;
      expect(size).toBeGreaterThanOrEqual(100);
    }).not.toThrow();
  });

  it("should have a removeAllListeners method that clears handlers", () => {
    const emitter = new EventEmitter();

    expect("removeAllListeners" in emitter).toBe(true);

    emitter.on("a", () => {});
    emitter.on("b", () => {});
    emitter.on("b", () => {});

    // Remove single event
    emitter.removeAllListeners("a");
    expect((emitter as any).handlers.has("a")).toBe(false);
    expect((emitter as any).handlers.has("b")).toBe(true);

    // Remove all
    emitter.removeAllListeners();
    expect((emitter as any).handlers.size).toBe(0);
  });

  it("should retain handler references even after module is conceptually destroyed", async () => {
    const emitter = new EventEmitter();

    let callCount = 0;

    class MyService {
      private data = new Array(1000).fill("leak");
      handleEvent() {
        callCount++;
      }
    }

    const service = new MyService();
    const boundHandler = service.handleEvent.bind(service);
    emitter.on("test.event", boundHandler);

    await emitter.emit("test.event", {});
    expect(callCount).toBe(1);

    const handlers = (emitter as any).handlers.get("test.event");
    expect(handlers).toHaveLength(1);
  });
});
