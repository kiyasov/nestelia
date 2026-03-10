import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";
import {
  EVENT_EMITTER_TOKEN,
  EventEmitter2,
} from "../../../packages/event-emitter/src";
import { NotificationListener } from "./notification.listener";
import { OrdersService } from "./orders.service";

let service: OrdersService;
let listener: NotificationListener;
let emitter: EventEmitter2;

beforeEach(async () => {
  emitter = new EventEmitter2({ wildcard: true });

  const moduleRef = await Test.createTestingModule({
    providers: [
      OrdersService,
      NotificationListener,
      { provide: EVENT_EMITTER_TOKEN, useValue: emitter },
      { provide: EventEmitter2, useValue: emitter },
    ],
  }).compile();

  service = moduleRef.get(OrdersService);
  listener = moduleRef.get(NotificationListener);

  // Manually wire @OnEvent handlers (mirrors what EventEmitterExplorer does)
  emitter.on("order.created", (o: unknown) => listener.handleOrderCreated(o as never));
  emitter.on("order.shipped", (o: unknown) => listener.handleOrderShipped(o as never));
  emitter.on("order.*", (o: unknown) => listener.handleAnyOrderEvent(o as never));
});

afterEach(() => {
  emitter.removeAllListeners();
});

describe("OrdersService", () => {
  it("creates an order", async () => {
    const order = await service.create("Widget", 29.99, "alice@example.com");
    expect(order.id).toBeDefined();
    expect(order.product).toBe("Widget");
  });

  it("emits order.created on create", async () => {
    await service.create("Widget", 29.99, "alice@example.com");
    const log = listener.getLog();
    expect(log.some((l) => l.includes("[Email] Order") && l.includes("confirmed"))).toBe(true);
  });

  it("emits order.* wildcard on create", async () => {
    await service.create("Widget", 29.99, "alice@example.com");
    const log = listener.getLog();
    expect(log.some((l) => l.includes("[Audit]"))).toBe(true);
  });

  it("emits order.shipped on ship", async () => {
    const order = await service.create("Gadget", 49.99, "bob@example.com");
    await service.ship(order.id);
    const log = listener.getLog();
    expect(log.some((l) => l.includes("[Email]") && l.includes("shipped"))).toBe(true);
  });

  it("returns undefined for unknown order id", async () => {
    const result = await service.ship("nonexistent-id");
    expect(result).toBeUndefined();
  });

  it("findAll returns all orders", async () => {
    await service.create("A", 1, "a@test.com");
    await service.create("B", 2, "b@test.com");
    expect(service.findAll()).toHaveLength(2);
  });
});
