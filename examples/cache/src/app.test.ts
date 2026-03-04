import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { ProductsService } from "./products.service";

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get(ProductsService);
  });

  it("returns product list", async () => {
    const result = await service.findAll();
    expect(result.products).toContain("Apple");
  });

  it("increments call count on each invocation", async () => {
    expect(service.getCallCount()).toBe(0);
    await service.findAll();
    await service.findAll();
    expect(service.getCallCount()).toBe(2);
  });
});

describe("Cache store (manual)", () => {
  it("stores and retrieves a value", async () => {
    const { createCache } = await import("cache-manager");
    const cache = await createCache();

    await cache.set("key", "value", 10);
    expect(await cache.get("key")).toBe("value");
  });

  it("returns undefined for missing key", async () => {
    const { createCache } = await import("cache-manager");
    const cache = await createCache();

    expect(await cache.get("missing")).toBeUndefined();
  });

  it("respects ttl expiration", async () => {
    const { createCache } = await import("cache-manager");
    const cache = await createCache();

    await cache.set("ttl-key", "data", 0.05); // 50ms
    await new Promise((r) => setTimeout(r, 100));
    expect(await cache.get("ttl-key")).toBeUndefined();
  });

  it("deletes a value", async () => {
    const { createCache } = await import("cache-manager");
    const cache = await createCache();

    await cache.set("del-key", "bye", 10);
    await cache.del("del-key");
    expect(await cache.get("del-key")).toBeUndefined();
  });
});
