import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

import { setupController } from "~/src/core/controller-setup";
import { Module } from "~/src/core/module.decorator";
import { Controller } from "~/src/decorators/controller.decorator";
import { Get } from "~/src/decorators/http.decorators";
import { Param, Query } from "~/src/decorators/param.decorators";
import { Container, DIContainer } from "~/src/di";
import { Injectable } from "~/src/di/injectable.decorator";

// ── Fixtures ──────────────────────────────────────────────────────────────────

@Injectable()
@Controller("/items")
class ItemController {
  @Get("/")
  findAll() {
    return { handler: "findAll" };
  }

  @Get("/stats")
  getStats() {
    return { handler: "getStats" };
  }

  @Get("/search")
  search() {
    return { handler: "search" };
  }

  @Get("/:id")
  findById() {
    return { handler: "findById" };
  }
}

// Controller where the parameterized route is declared BEFORE static ones
@Injectable()
@Controller("/products")
class ReversedController {
  @Get("/:id")
  findById() {
    return { handler: "findById" };
  }

  @Get("/stats")
  getStats() {
    return { handler: "getStats" };
  }

  @Get("/categories")
  getCategories() {
    return { handler: "getCategories" };
  }
}

@Module({
  providers: [ItemController, ReversedController],
  controllers: [ItemController, ReversedController],
})
class TestModule {}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Route ordering — static routes before parameterized", () => {
  let app: Elysia;

  beforeEach(async () => {
    Container.instance.clear();
    DIContainer.register([ItemController, ReversedController], TestModule as any);
    DIContainer.registerControllers([ItemController, ReversedController], TestModule as any);

    app = new Elysia();
    await setupController(app, ItemController, TestModule, "");
    await setupController(app, ReversedController, TestModule, "");
  });

  afterEach(() => {
    Container.instance.clear();
  });

  it("matches /items/stats to static route, not /:id", async () => {
    const res = await app.handle(new Request("http://localhost/items/stats"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handler: "getStats" });
  });

  it("matches /items/search to static route, not /:id", async () => {
    const res = await app.handle(new Request("http://localhost/items/search"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handler: "search" });
  });

  it("matches /items/123 to /:id route", async () => {
    const res = await app.handle(new Request("http://localhost/items/123"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handler: "findById" });
  });

  it("matches /products/stats even when /:id is declared first", async () => {
    const res = await app.handle(new Request("http://localhost/products/stats"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handler: "getStats" });
  });

  it("matches /products/categories even when /:id is declared first", async () => {
    const res = await app.handle(new Request("http://localhost/products/categories"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handler: "getCategories" });
  });

  it("matches /products/abc to /:id when no static route matches", async () => {
    const res = await app.handle(new Request("http://localhost/products/abc"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ handler: "findById" });
  });
});
