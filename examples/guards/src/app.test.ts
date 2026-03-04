import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Elysia } from "elysia";

import { createElysiaApplication } from "../../../index";

import { AppModule } from "./app.module";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let server: Elysia;

beforeAll(async () => {
  const app = await createElysiaApplication(AppModule);
  server = app.getHttpServer();
});

afterAll(() => {
  // No port is bound in tests — nothing to stop
});

function get(path: string, headers: Record<string, string> = {}): Promise<Response> {
  return server.handle(new Request(`http://localhost${path}`, { headers }));
}

// ─── Public endpoint ──────────────────────────────────────────────────────────

describe("GET /api/public (no guards)", () => {
  it("is accessible without any headers", async () => {
    const res = await get("/api/public");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Public endpoint — no auth required");
  });
});

// ─── Class-level guard (AuthGuard) ────────────────────────────────────────────

describe("GET /api/profile (AuthGuard via class decorator)", () => {
  it("returns 403 when Authorization header is missing", async () => {
    const res = await get("/api/profile");
    expect(res.status).toBe(403);
  });

  it("returns 200 when Authorization header is present", async () => {
    const res = await get("/api/profile", { authorization: "Bearer token123" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Authenticated successfully");
  });
});

// ─── Chained guards (AuthGuard + RolesGuard) ─────────────────────────────────

describe("GET /api/admin (AuthGuard + RolesGuard)", () => {
  it("returns 403 when Authorization header is missing", async () => {
    const res = await get("/api/admin");
    expect(res.status).toBe(403);
  });

  it("returns 403 when authorized but not admin role", async () => {
    const res = await get("/api/admin", {
      authorization: "Bearer token123",
      "x-role": "user",
    });
    expect(res.status).toBe(403);
  });

  it("returns 200 when authorized and role is admin", async () => {
    const res = await get("/api/admin", {
      authorization: "Bearer token123",
      "x-role": "admin",
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("Admin area");
  });
});
