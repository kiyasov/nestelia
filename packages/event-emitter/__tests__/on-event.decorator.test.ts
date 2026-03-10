import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import { ON_EVENT_METADATA } from "../src/event-emitter.constants";
import { OnEvent } from "../src/decorators/on-event.decorator";
import type { OnEventMetadata } from "../src/interfaces";

describe("@OnEvent decorator", () => {
  it("stores metadata on the class", () => {
    class Listener {
      @OnEvent("order.created")
      handle() {}
    }

    const meta: OnEventMetadata[] = Reflect.getMetadata(ON_EVENT_METADATA, Listener);
    expect(meta).toHaveLength(1);
    expect(meta[0].event).toBe("order.created");
    expect(meta[0].methodName).toBe("handle");
    expect(meta[0].once).toBe(false);
  });

  it("supports once option", () => {
    class Listener {
      @OnEvent("init", { once: true })
      handle() {}
    }

    const meta: OnEventMetadata[] = Reflect.getMetadata(ON_EVENT_METADATA, Listener);
    expect(meta[0].once).toBe(true);
  });

  it("collects multiple handlers on the same class", () => {
    class Listener {
      @OnEvent("a")
      handleA() {}

      @OnEvent("b")
      handleB() {}
    }

    const meta: OnEventMetadata[] = Reflect.getMetadata(ON_EVENT_METADATA, Listener);
    expect(meta).toHaveLength(2);
    expect(meta.map((m) => m.event)).toEqual(["a", "b"]);
  });

  it("supports symbol events", () => {
    const SYM = Symbol("sym");

    class Listener {
      @OnEvent(SYM)
      handle() {}
    }

    const meta: OnEventMetadata[] = Reflect.getMetadata(ON_EVENT_METADATA, Listener);
    expect(meta[0].event).toBe(SYM);
  });
});
