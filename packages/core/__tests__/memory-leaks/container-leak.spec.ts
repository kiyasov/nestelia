import "reflect-metadata";

import { afterEach, describe, expect, it } from "bun:test";

import { Container } from "~/src/di/container";
import { Injectable } from "~/src/di/injectable.decorator";
import { Scope } from "~/src/di/scope-options.interface";
import type { ProviderToken } from "~/src/di/provider.interface";
import { getLifecycleManager } from "~/src/lifecycle/lifecycle-manager";

/**
 * Memory leak test: Container.clear() does not clear related global state.
 *
 * The DI container's clear() method resets its own Maps/Sets but does NOT
 * propagate cleanup to:
 * - LifecycleManager (providers array)
 * - Global exception filters
 * - Global event emitter
 */
describe("Container — memory leak on clear()", () => {
  afterEach(() => {
    Container.instance.clear();
  });

  it("should clear its own internal maps on clear()", () => {
    const container = Container.instance;

    @Injectable()
    class TestService {}

    container.register([TestService]);

    expect(container.getModules().size).toBeGreaterThan(0);

    container.clear();

    expect(container.getModules().size).toBe(0);
  });

  it("should clear LifecycleManager providers on clear()", () => {
    const container = Container.instance;
    const manager = getLifecycleManager();

    let initCalled = false;
    const provider = {
      onModuleInit: () => {
        initCalled = true;
      },
    };
    manager.register(provider);

    // Clear container — now also clears lifecycle manager
    container.clear();

    manager.triggerOnModuleInit();
    expect(initCalled).toBe(false);
  });

  it("should demonstrate request context containers are per-request (allocation pattern)", async () => {
    const container = Container.instance;

    @Injectable({ scope: Scope.REQUEST })
    class RequestScopedService {
      readonly id = Math.random();
    }

    container.register([RequestScopedService]);

    const contexts: Map<ProviderToken, unknown>[] = [];

    // Simulate 100 requests — each creates a new Map
    for (let i = 0; i < 100; i++) {
      const ctx = {
        id: `req-${i}`,
        container: new Map<ProviderToken, unknown>(),
      };
      contexts.push(ctx.container);

      await Container.runInRequestContext(ctx, () =>
        container.get(RequestScopedService),
      );
    }

    // Each request created a separate container Map.
    // These are only GC'd when the request context goes out of scope.
    expect(contexts.length).toBe(100);
    expect(contexts[0]).not.toBe(contexts[1]);
  });
});
