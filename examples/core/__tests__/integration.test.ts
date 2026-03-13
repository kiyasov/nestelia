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

function req(
  method: string,
  path: string,
  body?: unknown,
): Promise<Response> {
  return server.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

describe("GET /todos (empty)", () => {
  it("returns an empty array initially", async () => {
    const res = await req("GET", "/todos/");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

describe("POST /todos", () => {
  it("creates a todo and returns it with id=1", async () => {
    const res = await req("POST", "/todos/", { title: "Buy milk" });
    expect(res.status).toBe(200);
    const todo = await res.json();
    expect(todo).toEqual({ id: 1, title: "Buy milk", done: false });
  });

  it("creates a second todo with id=2", async () => {
    const res = await req("POST", "/todos/", { title: "Walk the dog" });
    expect(res.status).toBe(200);
    const todo = await res.json();
    expect(todo).toEqual({ id: 2, title: "Walk the dog", done: false });
  });
});

describe("GET /todos (with items)", () => {
  it("returns all todos", async () => {
    const res = await req("GET", "/todos/");
    expect(res.status).toBe(200);
    const todos = await res.json();
    expect(todos).toHaveLength(2);
    expect(todos[0].title).toBe("Buy milk");
    expect(todos[1].title).toBe("Walk the dog");
  });
});

describe("GET /todos/:id", () => {
  it("returns the correct todo by id", async () => {
    const res = await req("GET", "/todos/1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 1, title: "Buy milk", done: false });
  });

  it("returns 404 for a non-existent id", async () => {
    const res = await req("GET", "/todos/999");
    expect(res.status).toBe(404);
  });
});

describe("PUT /todos/:id", () => {
  it("updates the title of an existing todo", async () => {
    const res = await req("PUT", "/todos/1", { title: "Buy oat milk" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: 1, title: "Buy oat milk", done: false });
  });

  it("returns 404 when updating a non-existent todo", async () => {
    const res = await req("PUT", "/todos/999", { title: "Ghost" });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /todos/:id", () => {
  it("deletes an existing todo and returns success", async () => {
    const res = await req("DELETE", "/todos/1");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it("returns 404 after the todo was deleted", async () => {
    const res = await req("GET", "/todos/1");
    expect(res.status).toBe(404);
  });

  it("returns 404 when deleting a non-existent todo", async () => {
    const res = await req("DELETE", "/todos/999");
    expect(res.status).toBe(404);
  });
});
