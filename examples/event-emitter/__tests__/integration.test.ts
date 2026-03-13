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

function post(path: string, body: unknown): Promise<Response> {
  return server.handle(
    new Request(`http://localhost${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

describe("GET /orders (empty)", () => {
  it("returns an empty list initially", async () => {
    const res = await server.handle(new Request("http://localhost/orders"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });
});

describe("POST /orders", () => {
  it("creates an order and returns it with a uuid id", async () => {
    const res = await post("/orders", {
      product: "Laptop",
      amount: 1,
      email: "alice@example.com",
    });
    expect(res.status).toBe(200);
    const order = await res.json();
    expect(order.product).toBe("Laptop");
    expect(order.amount).toBe(1);
    expect(order.email).toBe("alice@example.com");
    expect(typeof order.id).toBe("string");
    expect(order.id).toHaveLength(36); // UUID v4
  });

  it("creates a second order", async () => {
    const res = await post("/orders", {
      product: "Phone",
      amount: 2,
      email: "bob@example.com",
    });
    expect(res.status).toBe(200);
    const order = await res.json();
    expect(order.product).toBe("Phone");
  });
});

describe("GET /orders (with items)", () => {
  it("returns all created orders", async () => {
    const res = await server.handle(new Request("http://localhost/orders"));
    expect(res.status).toBe(200);
    const orders = await res.json();
    expect(orders).toHaveLength(2);
    expect(orders[0].product).toBe("Laptop");
    expect(orders[1].product).toBe("Phone");
  });
});

describe("POST /orders/:id/ship", () => {
  it("ships an existing order and returns it", async () => {
    const createRes = await post("/orders", {
      product: "Book",
      amount: 3,
      email: "charlie@example.com",
    });
    const created = await createRes.json();

    const shipRes = await server.handle(
      new Request(`http://localhost/orders/${created.id}/ship`, { method: "POST" }),
    );
    expect(shipRes.status).toBe(200);
    const shipped = await shipRes.json();
    expect(shipped.id).toBe(created.id);
    expect(shipped.product).toBe("Book");
  });

  it("returns error for a non-existent order id", async () => {
    const res = await server.handle(
      new Request("http://localhost/orders/non-existent-id/ship", { method: "POST" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.error).toBe("Order not found");
  });
});
