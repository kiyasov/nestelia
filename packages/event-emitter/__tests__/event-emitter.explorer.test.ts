import "reflect-metadata";
import { beforeEach, describe, expect, it } from "bun:test";
import { Container, STATIC_CONTEXT } from "nestelia";
import { EventEmitterExplorer } from "../src/event-emitter.explorer";
import { EventEmitterService } from "../src/event-emitter.service";
import { OnEvent } from "../src/decorators";

describe("EventEmitterExplorer", () => {
  let emitter: EventEmitterService;
  let explorer: EventEmitterExplorer;

  beforeEach(() => {
    emitter = new EventEmitterService();
    explorer = new EventEmitterExplorer(emitter);
    Container.instance.clear();
  });

  it("registers @OnEvent handlers during bootstrap", () => {
    let called = false;

    class TestSubscriber {
      @OnEvent("test.event")
      handleEvent() {
        called = true;
      }
    }

    const moduleRef = Container.instance.addModule(TestSubscriber, "TestModule");
    moduleRef.addProvider(TestSubscriber);
    // Simulate instance resolution
    const wrapper = moduleRef.getProviderByKey(TestSubscriber)!;
    wrapper.setInstanceByContextId(STATIC_CONTEXT, {
      instance: new TestSubscriber(),
      isResolved: true,
      isPending: false,
    });

    explorer.onApplicationBootstrap();
    emitter.emit("test.event");

    expect(called).toBe(true);
  });

  it("removes only its own handlers on destroy, leaving manual ones intact", () => {
    let manualCount = 0;
    let decoratedCount = 0;

    class TestSubscriber {
      @OnEvent("test.event")
      handleEvent() {
        decoratedCount++;
      }
    }

    const moduleRef = Container.instance.addModule(TestSubscriber, "TestModule");
    moduleRef.addProvider(TestSubscriber);
    const wrapper = moduleRef.getProviderByKey(TestSubscriber)!;
    wrapper.setInstanceByContextId(STATIC_CONTEXT, {
      instance: new TestSubscriber(),
      isResolved: true,
      isPending: false,
    });

    // Register a manual handler before bootstrap
    emitter.on("test.event", () => {
      manualCount++;
    });

    explorer.onApplicationBootstrap();
    explorer.onModuleDestroy();

    // After destroy, manual handler should still work
    emitter.emit("test.event");

    expect(manualCount).toBe(1);
    expect(decoratedCount).toBe(0);
  });

  it("removes all registered handlers for the same event", () => {
    let count = 0;

    class TestSubscriber {
      @OnEvent("test.event")
      handleA() {
        count++;
      }

      @OnEvent("test.event")
      handleB() {
        count++;
      }
    }

    const moduleRef = Container.instance.addModule(TestSubscriber, "TestModule");
    moduleRef.addProvider(TestSubscriber);
    const wrapper = moduleRef.getProviderByKey(TestSubscriber)!;
    wrapper.setInstanceByContextId(STATIC_CONTEXT, {
      instance: new TestSubscriber(),
      isResolved: true,
      isPending: false,
    });

    explorer.onApplicationBootstrap();
    expect(emitter.listenerCount("test.event")).toBe(2);

    explorer.onModuleDestroy();
    expect(emitter.listenerCount("test.event")).toBe(0);
  });
});
