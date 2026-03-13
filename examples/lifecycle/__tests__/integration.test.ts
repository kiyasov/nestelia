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

describe("GET /status", () => {
  it("db is connected after onModuleInit", async () => {
    const res = await server.handle(new Request("http://localhost/status"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.db).toBe(true);
  });

  it("cache is ready after onModuleInit (resolved DatabaseService via ModuleRef)", async () => {
    const res = await server.handle(new Request("http://localhost/status"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.cache).toBe(true);
  });

  it("dbUrl is populated by DatabaseService.onModuleInit", async () => {
    const res = await server.handle(new Request("http://localhost/status"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dbUrl).toBe("postgres://localhost:5432/app");
  });
});
