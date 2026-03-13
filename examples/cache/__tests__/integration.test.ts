import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Elysia } from "elysia";

import { createElysiaApplication } from "../../../index";
import { AppModule } from "../src/app.module";

let server: Elysia;

beforeAll(async () => {
  const app = await createElysiaApplication(AppModule);
  server = app.getHttpServer();
});

afterAll(async () => {
  // No port bound in tests
});

function get(path: string): Promise<Response> {
  return server.handle(new Request(`http://localhost${path}`));
}

describe("GET /products/manual-cache", () => {
  it("first call hits DB and returns source=db", async () => {
    const res = await get("/products/manual-cache");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("db");
    expect(body.data.products).toEqual(["Apple", "Banana", "Cherry"]);
  });

  it("second call is served from cache (source=cache)", async () => {
    const res = await get("/products/manual-cache");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("cache");
    expect(body.data.products).toEqual(["Apple", "Banana", "Cherry"]);
  });
});

describe("GET /products/stats", () => {
  it("dbCalls is 1 — manual-cache route hit DB only once", async () => {
    const res = await get("/products/stats");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dbCalls).toBe(1);
  });
});

describe("GET /products (no interceptor, always hits DB)", () => {
  it("each call increments dbCalls", async () => {
    const before = await (await get("/products/stats")).json();
    const startCount = (before as { dbCalls: number }).dbCalls;

    await get("/products/");
    await get("/products/");

    const after = await (await get("/products/stats")).json();
    const endCount = (after as { dbCalls: number }).dbCalls;

    // Two GET /products/ calls → two more DB calls
    expect(endCount).toBe(startCount + 2);
  });
});
