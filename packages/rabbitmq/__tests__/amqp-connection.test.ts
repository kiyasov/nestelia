import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it, jest, mock } from "bun:test";

// ── amqplib mock ────────────────────────────────────────────────────────
// We build a realistic mock of amqplib so that AmqpConnection's dynamic
// `import("amqplib")` resolves without a running broker.

function createMockChannel() {
  const consumers = new Map<string, (msg: unknown) => void>();
  let consumerTagCounter = 0;

  const channel = {
    assertExchange: jest.fn(async () => ({ exchange: "" })),
    checkExchange: jest.fn(async () => ({})),
    assertQueue: jest.fn(async (_q: string, _opts?: unknown) => ({
      queue: _q || `amq.gen-${++consumerTagCounter}`,
      messageCount: 0,
      consumerCount: 0,
    })),
    bindQueue: jest.fn(async () => ({})),
    deleteQueue: jest.fn(async () => ({ messageCount: 0 })),
    publish: jest.fn((_exchange: string, _rk: string, content: Buffer, opts?: Record<string, unknown>) => {
      // For RPC: if there's a replyTo, simulate response delivery
      if (opts?.replyTo) {
        const replyConsumer = consumers.get(opts.replyTo as string);
        if (replyConsumer) {
          setTimeout(() => {
            replyConsumer({
              content: Buffer.from(JSON.stringify({ result: "ok" })),
              fields: { deliveryTag: 1, redelivered: false, exchange: "", routingKey: "" },
              properties: { correlationId: opts.correlationId },
            });
          }, 5);
        }
      }
      return true;
    }),
    sendToQueue: jest.fn(() => true),
    consume: jest.fn(async (queue: string, cb: (msg: unknown) => void, _opts?: unknown) => {
      const tag = `ctag-${++consumerTagCounter}`;
      consumers.set(queue, cb);
      consumers.set(tag, cb);
      return { consumerTag: tag };
    }),
    cancel: jest.fn(async () => ({})),
    ack: jest.fn(),
    nack: jest.fn(),
    reject: jest.fn(),
    prefetch: jest.fn(async () => {}),
    close: jest.fn(async () => {}),
    on: jest.fn(),
    bindExchange: jest.fn(async () => ({})),
    _simulateMessage(queue: string, content: unknown, properties: Record<string, unknown> = {}) {
      const cb = consumers.get(queue);
      if (cb) {
        cb({
          content: Buffer.from(JSON.stringify(content)),
          fields: { deliveryTag: 1, redelivered: false, exchange: "", routingKey: "test" },
          properties: { headers: {}, ...properties },
        });
      }
    },
    _consumers: consumers,
  };
  return channel;
}

function createMockConnection(channel: ReturnType<typeof createMockChannel>) {
  return {
    createChannel: jest.fn(async () => channel),
    close: jest.fn(async () => {}),
    on: jest.fn(),
  };
}

let mockChannel: ReturnType<typeof createMockChannel>;
let mockConn: ReturnType<typeof createMockConnection>;

mock.module("amqplib", () => ({
  connect: jest.fn(async () => {
    mockChannel = createMockChannel();
    mockConn = createMockConnection(mockChannel);
    return mockConn;
  }),
}));

// ── Import after mock registration ──────────────────────────────────────
import { AmqpConnection } from "../src/connection/amqp-connection";
import { RabbitSubscribe, RabbitRPC } from "../src/decorators/rabbitmq.decorators";
import { Logger } from "nestelia";

// ── Helpers ─────────────────────────────────────────────────────────────
function createConnection(overrides: Record<string, unknown> = {}) {
  const logger = new Logger("RabbitMQTest");
  logger.log = () => {};
  logger.warn = () => {};
  logger.error = () => {};
  logger.debug = () => {};
  return new AmqpConnection(
    { uri: "amqp://localhost:5672", reconnect: false, ...overrides } as never,
    logger,
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────

describe("AmqpConnection", () => {
  let conn: AmqpConnection;

  beforeEach(async () => {
    conn = createConnection();
    await conn.connect();
  });

  afterEach(async () => {
    try {
      await conn.disconnect();
    } catch {
      // ignore
    }
  });

  // ── Connection lifecycle ─────────────────────────────────────────────

  describe("connect / disconnect", () => {
    it("creates three channels (consumer + publisher + assertion)", () => {
      expect(mockConn.createChannel).toHaveBeenCalledTimes(3);
    });

    it("sets prefetch on consumer channel", () => {
      expect(mockChannel.prefetch).toHaveBeenCalledWith(10);
    });

    it("reports connection as ready", () => {
      expect(conn.isConnectionReady()).toBe(true);
    });

    it("is not ready after disconnect", async () => {
      await conn.disconnect();
      expect(conn.isConnectionReady()).toBe(false);
    });

    it("skips double connect", async () => {
      const callsBefore = mockConn.createChannel.mock.calls.length;
      await conn.connect();
      expect(mockConn.createChannel.mock.calls.length).toBe(callsBefore);
    });

    it("throws for missing URL", async () => {
      const bad = createConnection({ uri: undefined, urls: undefined });
      await expect(bad.connect()).rejects.toThrow("URL not provided");
    });

    it("throws for invalid URL", async () => {
      const bad = createConnection({ uri: "http://invalid" });
      await expect(bad.connect()).rejects.toThrow("Invalid RabbitMQ URL format");
    });

    it("accepts urls array fallback", async () => {
      const c = createConnection({ uri: undefined, urls: ["amqp://localhost:5672"] });
      await c.connect();
      expect(c.isConnectionReady()).toBe(true);
      await c.disconnect();
    });
  });

  // ── Exchange assertion ──────────────────────────────────────────────

  describe("assertExchange", () => {
    it("asserts exchange via channel with explicit type", async () => {
      await conn.assertExchange({ name: "test-exchange", type: "topic" });
      expect(mockChannel.assertExchange).toHaveBeenCalledWith("test-exchange", "topic", undefined);
    });

    it("defaults to 'topic' when type is omitted", async () => {
      await conn.assertExchange({ name: "default-type-ex" });
      expect(mockChannel.assertExchange).toHaveBeenCalledWith("default-type-ex", "topic", undefined);
    });

    it("uses defaultExchangeType from config", async () => {
      const c = createConnection({ defaultExchangeType: "fanout" });
      await c.connect();
      await c.assertExchange({ name: "fanout-ex" });
      expect(mockChannel.assertExchange).toHaveBeenCalledWith("fanout-ex", "fanout", undefined);
      await c.disconnect();
    });

    it("applies exchange prefix", async () => {
      const c = createConnection({ exchangePrefix: "myapp" });
      await c.connect();
      await c.assertExchange({ name: "events", type: "fanout" });
      expect(mockChannel.assertExchange).toHaveBeenCalledWith("myapp.events", "fanout", undefined);
      await c.disconnect();
    });

    it("uses checkExchange when createIfNotExists is false", async () => {
      await conn.assertExchange({ name: "existing-ex", createIfNotExists: false });
      expect(mockChannel.assertExchange).not.toHaveBeenCalledWith(
        "existing-ex",
        expect.anything(),
        expect.anything(),
      );
      expect(mockChannel.checkExchange).toHaveBeenCalledWith("existing-ex");
    });

    it("skips duplicate assertion", async () => {
      await conn.assertExchange({ name: "dup", type: "direct" });
      await conn.assertExchange({ name: "dup", type: "direct" });
      const calls = mockChannel.assertExchange.mock.calls.filter(
        (c: unknown[]) => (c[0] as string) === "dup",
      );
      expect(calls).toHaveLength(1);
    });

    it("throws for exchange name with null byte", async () => {
      await expect(conn.assertExchange({ name: "bad\x00name" })).rejects.toThrow(
        "Invalid exchange name",
      );
    });
  });

  // ── Queue assertion ─────────────────────────────────────────────────

  describe("assertQueue", () => {
    it("asserts queue via channel", async () => {
      await conn.assertQueue({ name: "test-queue" });
      expect(mockChannel.assertQueue).toHaveBeenCalledWith("test-queue", undefined);
    });

    it("applies queue prefix", async () => {
      const c = createConnection({ queuePrefix: "svc" });
      await c.connect();
      await c.assertQueue({ name: "jobs" });
      expect(mockChannel.assertQueue).toHaveBeenCalledWith("svc.jobs", undefined);
      await c.disconnect();
    });

    it("binds queue via bindings array", async () => {
      await conn.assertQueue({
        name: "bound-queue",
        bindings: [{ exchange: "ex", routingKey: "rk" }],
      });
      expect(mockChannel.bindQueue).toHaveBeenCalledWith("bound-queue", "ex", "rk", undefined);
    });

    it("binds queue via shortcut exchange + routingKey", async () => {
      await conn.assertQueue({
        name: "shortcut-q",
        exchange: "ex2",
        routingKey: "key2",
      });
      expect(mockChannel.bindQueue).toHaveBeenCalledWith("shortcut-q", "ex2", "key2");
    });

    it("skips duplicate assertion", async () => {
      await conn.assertQueue({ name: "dup-q" });
      await conn.assertQueue({ name: "dup-q" });
      const calls = mockChannel.assertQueue.mock.calls.filter(
        (c: unknown[]) => (c[0] as string) === "dup-q",
      );
      expect(calls).toHaveLength(1);
    });
  });

  // ── Publish ─────────────────────────────────────────────────────────

  describe("publish", () => {
    it("publishes JSON-serialized message to exchange", async () => {
      const result = await conn.publish("ex", "rk", { hello: "world" });
      expect(result).toBe(true);
      expect(mockChannel.publish).toHaveBeenCalled();
      const [exchange, routingKey, content] = mockChannel.publish.mock.calls[0] as [
        string,
        string,
        Buffer,
      ];
      expect(exchange).toBe("ex");
      expect(routingKey).toBe("rk");
      expect(JSON.parse(content.toString())).toEqual({ hello: "world" });
    });

    it("passes options (headers, priority, etc.)", async () => {
      await conn.publish("ex", "rk", {}, {
        headers: { "x-custom": "val" },
        priority: 5,
        persistent: false,
      });
      const opts = mockChannel.publish.mock.calls[0]?.[3] as Record<string, unknown>;
      expect(opts.headers).toEqual({ "x-custom": "val" });
      expect(opts.priority).toBe(5);
      expect(opts.persistent).toBe(false);
    });

    it("defaults persistent to true", async () => {
      await conn.publish("ex", "rk", {});
      const opts = mockChannel.publish.mock.calls[0]?.[3] as Record<string, unknown>;
      expect(opts.persistent).toBe(true);
    });

    it("throws when publisher channel is not available", async () => {
      await conn.disconnect();
      await expect(conn.publish("ex", "rk", {})).rejects.toThrow("publisher channel not available");
    });
  });

  // ── sendToQueue ─────────────────────────────────────────────────────

  describe("sendToQueue", () => {
    it("sends message directly to queue", async () => {
      const result = await conn.sendToQueue("my-queue", { data: 1 });
      expect(result).toBe(true);
      expect(mockChannel.sendToQueue).toHaveBeenCalled();
      const [queue, content] = (mockChannel.sendToQueue.mock.calls as any)[0] as [string, Buffer];
      expect(queue).toBe("my-queue");
      expect(JSON.parse(content.toString())).toEqual({ data: 1 });
    });

    it("applies queue prefix", async () => {
      const c = createConnection({ queuePrefix: "app" });
      await c.connect();
      await c.sendToQueue("tasks", {});
      const [queue] = (mockChannel.sendToQueue.mock.calls as any)[0] as [string];
      expect(queue).toBe("app.tasks");
      await c.disconnect();
    });
  });

  // ── Subscribe ───────────────────────────────────────────────────────

  describe("subscribe", () => {
    it("returns a consumer tag", async () => {
      const tag = await conn.subscribe("q", () => {});
      expect(typeof tag).toBe("string");
      expect(tag.startsWith("ctag-")).toBe(true);
    });

    it("calls handler with deserialized message on delivery", async () => {
      let received: unknown = null;
      await conn.subscribe("sub-q", (msg) => {
        received = msg;
      });

      mockChannel._simulateMessage("sub-q", { payload: 42 });

      expect(received).not.toBeNull();
      expect((received as { content: { payload: number } }).content).toEqual({ payload: 42 });
    });

    it("provides ack/nack/reject on message", async () => {
      let msg: { ack: () => void; nack: () => void; reject: () => void } | null = null;
      await conn.subscribe("ack-q", (m) => {
        msg = m as typeof msg;
      });

      mockChannel._simulateMessage("ack-q", {});
      expect(msg).not.toBeNull();

      msg!.ack();
      expect(mockChannel.ack).toHaveBeenCalled();
    });
  });

  // ── Unsubscribe ─────────────────────────────────────────────────────

  describe("unsubscribe", () => {
    it("cancels consumer by tag", async () => {
      const tag = await conn.subscribe("unsub-q", () => {});
      await conn.unsubscribe(tag);
      expect(mockChannel.cancel).toHaveBeenCalledWith(tag);
    });
  });

  // ── RPC request ─────────────────────────────────────────────────────

  describe("request (RPC)", () => {
    it("sends request and receives response", async () => {
      const result = await conn.request({
        exchange: "rpc-ex",
        routingKey: "calc.add",
        payload: { a: 1, b: 2 },
        timeout: 5000,
      });
      expect(result).toEqual({ result: "ok" });
    });

    it("throws on timeout", async () => {
      mockChannel.publish.mockImplementationOnce(() => true);

      await expect(
        conn.request({
          exchange: "rpc-ex",
          routingKey: "slow",
          payload: {},
          timeout: 50,
        }),
      ).rejects.toThrow("timeout");
    });

    it("throws when channel not available", async () => {
      await conn.disconnect();
      await expect(
        conn.request({ exchange: "x", routingKey: "y", payload: {} }),
      ).rejects.toThrow("channel not available");
    });
  });

  // ── Config exchanges/queues on connect ──────────────────────────────

  describe("auto-assertion on connect", () => {
    it("asserts configured exchanges on connect", async () => {
      const c = createConnection({
        exchanges: [
          { name: "ex1", type: "topic" },
          { name: "ex2", type: "fanout" },
        ],
      });
      await c.connect();
      // Filter to only ex1/ex2 calls (other tests may have asserted exchanges)
      const exCalls = mockChannel.assertExchange.mock.calls.filter(
        (c: unknown[]) => (c[0] as string) === "ex1" || (c[0] as string) === "ex2",
      );
      expect(exCalls).toHaveLength(2);
      await c.disconnect();
    });

    it("asserts configured queues on connect", async () => {
      const c = createConnection({
        queues: [{ name: "q1" }, { name: "q2" }],
      });
      await c.connect();
      const queueCalls = mockChannel.assertQueue.mock.calls.filter(
        (c: unknown[]) => c[0] === "q1" || c[0] === "q2",
      );
      expect(queueCalls).toHaveLength(2);
      await c.disconnect();
    });
  });

  // ── Channel getters ─────────────────────────────────────────────────

  describe("getters", () => {
    it("getChannel returns consumer channel", () => {
      expect(conn.getChannel()).not.toBeNull();
    });

    it("getPublisherChannel returns publisher channel", () => {
      expect(conn.getPublisherChannel()).not.toBeNull();
    });

    it("getConnection returns underlying connection", () => {
      expect(conn.getConnection()).not.toBeNull();
    });

    it("returns null after disconnect", async () => {
      await conn.disconnect();
      expect(conn.getChannel()).toBeNull();
      expect(conn.getPublisherChannel()).toBeNull();
      expect(conn.getConnection()).toBeNull();
    });
  });

  // ── Disconnect cleanup ──────────────────────────────────────────────

  describe("disconnect cleanup", () => {
    it("cancels active consumers on disconnect", async () => {
      await conn.subscribe("cleanup-q", () => {});
      await conn.disconnect();
      expect(mockChannel.cancel).toHaveBeenCalled();
    });

    it("closes both channels and connection", async () => {
      await conn.disconnect();
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConn.close).toHaveBeenCalled();
    });
  });

  // ── registerHandlers ────────────────────────────────────────────────

  describe("registerHandlers", () => {
    it("asserts queue, binds, and starts consuming for @RabbitSubscribe (no exchange assert)", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "events", routingKey: "user.created", queue: "user-q" })
        handleUser() {}
      }

      mockChannel.assertExchange.mockClear();
      await conn.registerHandlers(new TestHandler());

      // Exchange is NOT asserted by subscriber — only by connect() from forRoot config
      const subscriberExchangeCalls = mockChannel.assertExchange.mock.calls.filter(
        (c: unknown[]) => c[0] === "events",
      );
      expect(subscriberExchangeCalls).toHaveLength(0);
      // Queue asserted
      const queueCalls = mockChannel.assertQueue.mock.calls.filter(
        (c: unknown[]) => c[0] === "user-q",
      );
      expect(queueCalls).toHaveLength(1);
      // Queue bound to exchange
      expect(mockChannel.bindQueue).toHaveBeenCalledWith("user-q", "events", "user.created", undefined);
      // Consumer started
      expect(mockChannel.consume).toHaveBeenCalled();
    });

    it("actually calls the handler method with message content", async () => {
      const received: unknown[] = [];

      class TestHandler {
        @RabbitSubscribe({ exchange: "events", routingKey: "order.created", queue: "order-q" })
        handleOrder(data: unknown) {
          received.push(data);
        }
      }

      await conn.registerHandlers(new TestHandler());

      // Simulate a message arriving on the queue
      mockChannel._simulateMessage("order-q", { orderId: "123", amount: 99 });

      // Wait for the async handler to complete
      await new Promise((r) => setTimeout(r, 10));

      expect(received).toHaveLength(1);
      expect(received[0]).toEqual({ orderId: "123", amount: 99 });
    });

    it("acks message after successful handler execution", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "ack-test-q" })
        handle() {}
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel._simulateMessage("ack-test-q", {});

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.ack).toHaveBeenCalled();
    });

    it("nacks message when handler throws", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "nack-test-q" })
        handle() {
          throw new Error("processing failed");
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel._simulateMessage("nack-test-q", {});

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.nack).toHaveBeenCalled();
    });

    it("handles multiple routing keys", async () => {
      class TestHandler {
        @RabbitSubscribe({
          exchange: "events",
          routingKey: ["order.created", "order.updated"],
          queue: "multi-rk-q",
        })
        handle() {}
      }

      await conn.registerHandlers(new TestHandler());

      // Should bind queue to both routing keys
      const bindCalls = mockChannel.bindQueue.mock.calls.filter(
        (c: unknown[]) => c[0] === "multi-rk-q",
      );
      expect(bindCalls).toHaveLength(2);
      expect((bindCalls[0] as any)[2]).toBe("order.created");
      expect((bindCalls[1] as any)[2]).toBe("order.updated");
    });

    it("registers @RabbitRPC handlers without asserting exchange, and replies", async () => {
      class CalcHandler {
        @RabbitRPC({ exchange: "rpc", routingKey: "calc.add", queue: "calc-q" })
        add(data: { a: number; b: number }) {
          return { result: data.a + data.b };
        }
      }

      mockChannel.assertExchange.mockClear();
      await conn.registerHandlers(new CalcHandler());

      // Exchange is NOT asserted by RPC handler — only by connect() from forRoot config
      const rpcExchangeCalls = mockChannel.assertExchange.mock.calls.filter(
        (c: unknown[]) => c[0] === "rpc",
      );
      expect(rpcExchangeCalls).toHaveLength(0);
      // Consumer started
      expect(mockChannel.consume).toHaveBeenCalled();

      // Simulate RPC request with replyTo
      mockChannel._simulateMessage("calc-q", { a: 3, b: 4 }, {
        replyTo: "amq.gen-reply",
        correlationId: "corr-123",
      });

      await new Promise((r) => setTimeout(r, 10));

      // Should send response to replyTo queue
      const replyCalls = mockChannel.sendToQueue.mock.calls.filter(
        (c: unknown[]) => c[0] === "amq.gen-reply",
      );
      expect(replyCalls).toHaveLength(1);
      const replyContent = JSON.parse(((replyCalls[0] as any)[1] as Buffer).toString());
      expect(replyContent).toEqual({ result: 7 });
      // Should include correlationId in reply
      expect(((replyCalls[0] as any)[2] as Record<string, unknown>).correlationId).toBe("corr-123");
    });

    it("silently skips classes with no handlers", async () => {
      class EmptyHandler {}
      // Should not throw
      await conn.registerHandlers(new EmptyHandler());
    });
  });

  // ── Full pub/sub integration ────────────────────────────────────────

  describe("publish → subscribe integration", () => {
    it("published message is received by subscriber handler", async () => {
      const received: unknown[] = [];

      class OrderHandler {
        @RabbitSubscribe({ exchange: "orders", routingKey: "order.created", queue: "orders-q" })
        onOrderCreated(data: unknown) {
          received.push(data);
        }
      }

      // Register handler (asserts queue, binds, starts consuming)
      await conn.registerHandlers(new OrderHandler());

      // Simulate what would happen when broker delivers a message
      // after publish("orders", "order.created", ...)
      mockChannel._simulateMessage("orders-q", { orderId: "abc", amount: 42 });

      await new Promise((r) => setTimeout(r, 10));

      expect(received).toHaveLength(1);
      expect(received[0]).toEqual({ orderId: "abc", amount: 42 });
      expect(mockChannel.ack).toHaveBeenCalled();
    });
  });

  // ── Nack return from handlers ───────────────────────────────────

  describe("Nack return", () => {
    it("nacks message when subscribe handler returns Nack", async () => {
      const { Nack } = await import("../src/nack");

      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "nack-q" })
        handle() {
          return new Nack(false);
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel._simulateMessage("nack-q", { test: true });

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.nack).toHaveBeenCalled();
      expect(mockChannel.ack).not.toHaveBeenCalled();
    });

    it("nacks with requeue when Nack(true)", async () => {
      const { Nack } = await import("../src/nack");

      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "requeue-q" })
        handle() {
          return new Nack(true);
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel.nack.mockClear();
      mockChannel._simulateMessage("requeue-q", { test: true });

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.nack).toHaveBeenCalledWith(
        expect.anything(), false, true,
      );
    });
  });

  // ── Error behaviors ─────────────────────────────────────────────

  describe("error behaviors", () => {
    it("ACK error behavior acks on error", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "ack-err-q", errorBehavior: "ACK" })
        handle() {
          throw new Error("boom");
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel.ack.mockClear();
      mockChannel._simulateMessage("ack-err-q", {});

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.ack).toHaveBeenCalled();
    });

    it("REQUEUE error behavior nacks with requeue on error", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "req-err-q", errorBehavior: "REQUEUE" })
        handle() {
          throw new Error("boom");
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel.nack.mockClear();
      mockChannel._simulateMessage("req-err-q", {});

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.nack).toHaveBeenCalledWith(
        expect.anything(), false, true,
      );
    });

    it("NACK error behavior nacks without requeue on error", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "nack-err-q", errorBehavior: "NACK" })
        handle() {
          throw new Error("boom");
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel.nack.mockClear();
      mockChannel._simulateMessage("nack-err-q", {});

      await new Promise((r) => setTimeout(r, 10));

      expect(mockChannel.nack).toHaveBeenCalledWith(
        expect.anything(), false, false,
      );
    });
  });

  // ── Exchange bindings ───────────────────────────────────────────

  describe("exchange bindings", () => {
    it("binds exchanges on connect", async () => {
      mockChannel.bindExchange = jest.fn(async () => ({}));

      const conn2 = createConnection({
        exchanges: [
          { name: "source-ex", type: "topic" },
          { name: "dest-ex", type: "topic" },
        ],
        exchangeBindings: [
          { source: "source-ex", destination: "dest-ex", pattern: "order.*" },
        ],
      });
      await conn2.connect();

      expect(mockChannel.bindExchange).toHaveBeenCalledWith(
        "dest-ex", "source-ex", "order.*", undefined,
      );
    });
  });

  // ── Graceful shutdown ───────────────────────────────────────────

  describe("graceful shutdown", () => {
    it("waits for outstanding messages before disconnecting", async () => {
      let resolveHandler: () => void;
      const handlerPromise = new Promise<void>((r) => { resolveHandler = r; });

      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "slow-q" })
        async handle() {
          await handlerPromise;
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel._simulateMessage("slow-q", {});

      // Start disconnect (should wait for handler)
      const disconnectPromise = conn.disconnect();

      // Handler is still running
      resolveHandler!();

      await disconnectPromise;

      // Should complete without errors
      expect(mockChannel.close).toHaveBeenCalled();
    });
  });

  // ── Consumer cancel/resume ──────────────────────────────────────

  describe("consumer cancel/resume", () => {
    it("cancelConsumer cancels without removing handler info", async () => {
      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "cancel-q" })
        handle() {}
      }

      await conn.registerHandlers(new TestHandler());

      const tags = conn.consumerTags;
      expect(tags.length).toBeGreaterThan(0);

      const tag = tags[tags.length - 1];
      await conn.cancelConsumer(tag);

      expect(mockChannel.cancel).toHaveBeenCalledWith(tag);
      // Handler info still available for resume
      expect(conn.getConsumer(tag)).toBeDefined();
    });
  });

  // ── Multiple RPC handlers per queue ─────────────────────────────

  describe("multiple RPC handlers per queue", () => {
    it("routes to correct handler by routing key", async () => {
      const addResults: unknown[] = [];
      const subResults: unknown[] = [];

      class CalcHandler {
        @RabbitRPC({ exchange: "rpc", routingKey: "calc.add", queue: "shared-rpc-q" })
        add(data: { a: number; b: number }) {
          addResults.push(data);
          return { result: data.a + data.b };
        }

        @RabbitRPC({ exchange: "rpc", routingKey: "calc.sub", queue: "shared-rpc-q" })
        sub(data: { a: number; b: number }) {
          subResults.push(data);
          return { result: data.a - data.b };
        }
      }

      await conn.registerHandlers(new CalcHandler());

      // Simulate message with routing key "calc.add"
      const addCb = mockChannel._consumers.get("shared-rpc-q");
      addCb?.({
        content: Buffer.from(JSON.stringify({ a: 10, b: 3 })),
        fields: { deliveryTag: 1, redelivered: false, exchange: "rpc", routingKey: "calc.add" },
        properties: { headers: {}, replyTo: "reply-q", correlationId: "c1" },
      });

      await new Promise((r) => setTimeout(r, 10));

      expect(addResults).toHaveLength(1);
      expect(subResults).toHaveLength(0);

      // Simulate message with routing key "calc.sub"
      addCb?.({
        content: Buffer.from(JSON.stringify({ a: 10, b: 3 })),
        fields: { deliveryTag: 2, redelivered: false, exchange: "rpc", routingKey: "calc.sub" },
        properties: { headers: {}, replyTo: "reply-q2", correlationId: "c2" },
      });

      await new Promise((r) => setTimeout(r, 10));

      expect(subResults).toHaveLength(1);
    });
  });

  // ── Handler config merging ──────────────────────────────────────

  describe("handler config merging", () => {
    it("merges module-level config with decorator config", async () => {
      const conn2 = createConnection({
        handlers: {
          "my-handler": { errorBehavior: "ACK" as const },
        },
      });
      await conn2.connect();

      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "merge-q", name: "my-handler" })
        handle() {
          throw new Error("test error");
        }
      }

      await conn2.registerHandlers(new TestHandler());

      mockChannel.ack.mockClear();
      mockChannel._simulateMessage("merge-q", {});

      await new Promise((r) => setTimeout(r, 10));

      // ACK behavior from module config should be applied
      expect(mockChannel.ack).toHaveBeenCalled();
    });
  });

  // ── @RabbitHeader / @RabbitPayload parameter decorators ─────────

  describe("parameter decorators", () => {
    it("@RabbitPayload extracts message, @RabbitHeader extracts headers", async () => {
      const { RabbitPayload, RabbitHeader } = await import("../src/decorators/rabbitmq.decorators");

      const received: { payload: unknown; headers: unknown }[] = [];

      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "param-q" })
        handle(@RabbitPayload() data: unknown, @RabbitHeader() hdrs: unknown) {
          received.push({ payload: data, headers: hdrs });
        }
      }

      await conn.registerHandlers(new TestHandler());

      // Simulate message with headers
      const cb = mockChannel._consumers.get("param-q");
      cb?.({
        content: Buffer.from(JSON.stringify({ name: "test" })),
        fields: { deliveryTag: 1, redelivered: false, exchange: "", routingKey: "rk" },
        properties: { headers: { "x-custom": "value" } },
      });

      await new Promise((r) => setTimeout(r, 10));

      expect(received).toHaveLength(1);
      expect(received[0].payload).toEqual({ name: "test" });
      expect(received[0].headers).toEqual({ "x-custom": "value" });
    });

    it("@RabbitPayload('key') extracts nested property", async () => {
      const { RabbitPayload } = await import("../src/decorators/rabbitmq.decorators");

      const received: unknown[] = [];

      class TestHandler {
        @RabbitSubscribe({ exchange: "ex", routingKey: "rk", queue: "nested-q" })
        handle(@RabbitPayload("name") name: string) {
          received.push(name);
        }
      }

      await conn.registerHandlers(new TestHandler());
      mockChannel._simulateMessage("nested-q", { name: "Alice", age: 30 });

      await new Promise((r) => setTimeout(r, 10));

      expect(received).toHaveLength(1);
      expect(received[0]).toBe("Alice");
    });
  });

  // ── defaultPublishOptions ───────────────────────────────────────

  describe("defaultPublishOptions", () => {
    it("merges default publish options", async () => {
      const conn2 = createConnection({
        defaultPublishOptions: { appId: "test-app" },
      });
      await conn2.connect();

      await conn2.publish("ex", "rk", { test: true });

      expect(mockChannel.publish).toHaveBeenCalledWith(
        "ex", "rk", expect.any(Buffer),
        expect.objectContaining({ appId: "test-app" }),
      );
    });
  });
});
