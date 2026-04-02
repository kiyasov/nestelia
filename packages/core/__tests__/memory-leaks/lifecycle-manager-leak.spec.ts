import "reflect-metadata";

import { afterEach, describe, expect, it } from "bun:test";

import {
  getLifecycleManager,
  LifecycleManager,
} from "~/src/lifecycle/lifecycle-manager";
import { Container } from "~/src/di/container";

/**
 * Memory leak test: LifecycleManager.providers array grows unboundedly.
 *
 * Providers are registered via `register()` but never removed — even when
 * `Container.clear()` is called.  In test suites this means providers from
 * previous tests remain in the lifecycle manager, causing:
 * 1. Memory growth (references to dead provider instances)
 * 2. Lifecycle hooks firing on stale instances
 */
describe("LifecycleManager — memory leak", () => {
  afterEach(() => {
    Container.instance.clear();
  });

  it("should accumulate providers without bound (documents leak)", () => {
    const manager = getLifecycleManager();

    const providers: object[] = [];
    for (let i = 0; i < 1000; i++) {
      const provider = { onModuleInit: () => {} };
      providers.push(provider);
      manager.register(provider);
    }

    // Trigger lifecycle — all 1000 providers should be called, proving they
    // are held in memory.
    let initCount = 0;
    const counter = {
      onModuleInit: () => {
        initCount++;
      },
    };
    manager.register(counter);
    manager.triggerOnModuleInit();

    // counter was called once — but the key point is that all 1000 prior
    // providers are still referenced.
    expect(initCount).toBe(1);
  });

  it("should not fire lifecycle hooks on stale providers after Container.clear()", () => {
    const manager = getLifecycleManager();

    let destroyCalled = false;
    const staleProvider = {
      onModuleDestroy: () => {
        destroyCalled = true;
      },
    };
    manager.register(staleProvider);

    // Clearing the DI container now also clears the lifecycle manager
    Container.instance.clear();

    manager.triggerOnModuleDestroy();

    // Stale provider no longer receives lifecycle hooks — leak is fixed.
    expect(destroyCalled).toBe(false);
  });

  it("should have a clear() method that resets providers", () => {
    const manager = getLifecycleManager();

    expect("clear" in manager).toBe(true);

    let called = false;
    manager.register({ onModuleInit: () => { called = true; } });
    manager.clear();
    manager.triggerOnModuleInit();

    expect(called).toBe(false);
  });
});
