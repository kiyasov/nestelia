import "reflect-metadata";

import { beforeEach, describe, expect, it, mock } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { RabbitMQService } from "../../../packages/rabbitmq/src";
import { OrdersHandler } from "./orders.handler";
import { OrdersService } from "./orders.service";
import type { OrderCreatedEvent } from "./orders.handler";

// ── Mock RabbitMQService ──────────────────────────────────────

const mockRabbit = {
  publish: mock(async () => true),
  isConnectionReady: mock(() => false),
};

describe("OrdersHandler", () => {
  let handler: OrdersHandler;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrdersHandler],
    }).compile();

    handler = module.get(OrdersHandler);
  });

  it("processes an incoming order event", async () => {
    const event: OrderCreatedEvent = {
      orderId: "ord-1",
      amount: 99.99,
      userId: "usr-1",
    };

    await handler.handleOrderCreated(event);

    expect(handler.processed).toHaveLength(1);
    expect(handler.processed[0].orderId).toBe("ord-1");
  });

  it("accumulates multiple events", async () => {
    await handler.handleOrderCreated({ orderId: "a", amount: 10, userId: "u1" });
    await handler.handleOrderCreated({ orderId: "b", amount: 20, userId: "u2" });
    expect(handler.processed).toHaveLength(2);
  });
});

describe("OrdersService", () => {
  let service: OrdersService;

  beforeEach(async () => {
    mockRabbit.publish.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: RabbitMQService, useValue: mockRabbit },
      ],
    }).compile();

    service = module.get(OrdersService);
  });

  it("publishes order.created event on create", async () => {
    const { orderId } = await service.createOrder(49.99, "user-123");

    expect(orderId).toBeDefined();
    expect(mockRabbit.publish).toHaveBeenCalledTimes(1);

    const [exchange, routingKey, payload] = (mockRabbit.publish as any).mock.calls[0];
    expect(exchange).toBe("orders");
    expect(routingKey).toBe("order.created");
    expect(payload.amount).toBe(49.99);
    expect(payload.userId).toBe("user-123");
  });

  it("returns a unique orderId each time", async () => {
    const { orderId: a } = await service.createOrder(1, "u");
    const { orderId: b } = await service.createOrder(2, "u");
    expect(a).not.toBe(b);
  });
});
