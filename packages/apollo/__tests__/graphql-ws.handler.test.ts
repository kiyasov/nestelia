import "reflect-metadata";

import { afterEach, describe, expect, it, mock } from "bun:test";
import { CloseCode } from "graphql-ws";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from "graphql";

import type { Elysia } from "elysia";
import { GraphQLWsHandler } from "../src/services/graphql-ws.handler";
import type {
  ApolloOptions,
  GraphQLWsSubscriptionsOptions,
} from "../src/interfaces";

// ─── Helpers ──────────────────────────────────────────────────────────────────

class MockSocket {
  readonly id: string;
  readonly data: { request: Request };
  readonly sent: Record<string, unknown>[] = [];
  closedWith?: number;

  constructor(id = "sock-1") {
    this.id = id;
    this.data = { request: new Request("http://localhost/graphql") };
  }

  send(msg: string): void {
    this.sent.push(JSON.parse(msg) as Record<string, unknown>);
  }

  close(code?: number): void {
    this.closedWith = code;
  }

  messages(type: string): Record<string, unknown>[] {
    return this.sent.filter((m) => m.type === type);
  }
}

type WsCallbacks = {
  open?: (socket: MockSocket) => void;
  message?: (socket: MockSocket, msg: unknown) => void | Promise<void>;
  close?: (socket: MockSocket) => void;
};

function makeApp() {
  const callbacks: WsCallbacks = {};
  return {
    ws(_path: string, opts: WsCallbacks) {
      Object.assign(callbacks, opts);
    },
    callbacks,
  };
}

function makeSchema(
  subscribeFn?: () => AsyncIterable<unknown> | AsyncIterator<unknown>,
): GraphQLSchema {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: "Query",
      fields: { _: { type: GraphQLString, resolve: () => null } },
    }),
    ...(subscribeFn && {
      subscription: new GraphQLObjectType({
        name: "Subscription",
        fields: {
          count: {
            type: GraphQLInt,
            subscribe: subscribeFn,
            resolve: (val: unknown) => val,
          },
        },
      }),
    }),
  });
}

function setup(opts: {
  schema?: GraphQLSchema;
  wsOptions?: Partial<GraphQLWsSubscriptionsOptions>;
  apolloOptions?: Partial<ApolloOptions>;
} = {}) {
  const app = makeApp();
  const schema = opts.schema ?? makeSchema();
  const handler = new GraphQLWsHandler(
    schema,
    { connectionInitWaitTimeout: 50, ...opts.wsOptions } as GraphQLWsSubscriptionsOptions,
    (opts.apolloOptions ?? {}) as ApolloOptions,
    app as unknown as Elysia,
  );
  handler.register("/graphql");
  return { callbacks: app.callbacks, schema };
}

/** Opens a connection and completes connection_init successfully. */
async function connect(callbacks: WsCallbacks, socket = new MockSocket()): Promise<MockSocket> {
  callbacks.open!(socket);
  await callbacks.message!(socket, { type: "connection_init", payload: {} });
  return socket;
}

/** Waits a number of milliseconds. */
const wait = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

afterEach(() => {
  mock.restore();
});

// ─── Connection lifecycle ──────────────────────────────────────────────────────

describe("connection lifecycle", () => {
  it("sends connection_ack after connection_init", async () => {
    const { callbacks } = setup();
    const socket = await connect(callbacks);
    expect(socket.messages("connection_ack")).toHaveLength(1);
  });

  it("closes with ConnectionInitialisationTimeout when no init is sent", async () => {
    const { callbacks } = setup({ wsOptions: { connectionInitWaitTimeout: 30 } });
    const socket = new MockSocket();
    callbacks.open!(socket);

    await wait(60);
    expect(socket.closedWith).toBe(CloseCode.ConnectionInitialisationTimeout);
  });

  it("does not close after init succeeds even after timeout elapses", async () => {
    const { callbacks } = setup({ wsOptions: { connectionInitWaitTimeout: 30 } });
    const socket = await connect(callbacks);

    await wait(60);
    expect(socket.closedWith).toBeUndefined();
  });

  it("calls onDisconnect when connection closes", async () => {
    const onDisconnect = mock(() => {});
    const { callbacks } = setup({ wsOptions: { onDisconnect } });
    const socket = await connect(callbacks);

    callbacks.close!(socket);
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("does not call onDisconnect for unknown socket", () => {
    const onDisconnect = mock(() => {});
    const { callbacks } = setup({ wsOptions: { onDisconnect } });

    // close without open
    callbacks.close!(new MockSocket("ghost"));
    expect(onDisconnect).not.toHaveBeenCalled();
  });
});

// ─── connection_init ──────────────────────────────────────────────────────────

describe("connection_init", () => {
  it("closes with Forbidden when onConnect throws", async () => {
    const { callbacks } = setup({
      wsOptions: { onConnect: async () => { throw new Error("auth failed"); } },
    });
    const socket = new MockSocket();
    callbacks.open!(socket);
    await callbacks.message!(socket, { type: "connection_init", payload: {} });

    expect(socket.closedWith).toBe(CloseCode.Forbidden);
    expect(socket.messages("connection_ack")).toHaveLength(0);
  });

  it("passes connectionParams to onConnect", async () => {
    const onConnect = mock((_ctx: unknown) => {});
    const { callbacks } = setup({ wsOptions: { onConnect } });
    const socket = new MockSocket();
    callbacks.open!(socket);
    await callbacks.message!(socket, {
      type: "connection_init",
      payload: { token: "secret" },
    });

    const ctx = (onConnect as ReturnType<typeof mock>).mock.calls[0]?.[0] as
      | { connectionParams: unknown }
      | undefined;
    expect(ctx?.connectionParams).toEqual({ token: "secret" });
  });
});

// ─── Message routing ──────────────────────────────────────────────────────────

describe("message routing", () => {
  it("closes with BadRequest on unparseable message", async () => {
    const { callbacks } = setup();
    const socket = await connect(callbacks);
    await callbacks.message!(socket, "not json {{{}}}");
    expect(socket.closedWith).toBe(CloseCode.BadRequest);
  });

  it("responds to ping with pong", async () => {
    const { callbacks } = setup();
    const socket = await connect(callbacks);
    await callbacks.message!(socket, { type: "ping" });
    expect(socket.messages("pong")).toHaveLength(1);
  });

  it("does not close on pong message", async () => {
    const { callbacks } = setup();
    const socket = await connect(callbacks);
    await callbacks.message!(socket, { type: "pong" });
    expect(socket.closedWith).toBeUndefined();
  });

  it("closes with BadRequest on unknown message type", async () => {
    const { callbacks } = setup();
    const socket = await connect(callbacks);
    await callbacks.message!(socket, { type: "not_a_real_type" });
    expect(socket.closedWith).toBe(CloseCode.BadRequest);
  });

  it("ignores messages from unknown sockets", async () => {
    const { callbacks } = setup();
    callbacks.open!(new MockSocket("real"));

    const ghost = new MockSocket("ghost");
    // no open() called for ghost
    await callbacks.message!(ghost, { type: "ping" });
    expect(ghost.sent).toHaveLength(0);
  });
});

// ─── subscribe ────────────────────────────────────────────────────────────────

describe("subscribe", () => {
  it("closes with Unauthorized when subscribe is sent before connection_init", async () => {
    const { callbacks } = setup();
    const socket = new MockSocket();
    callbacks.open!(socket);
    await callbacks.message!(socket, {
      type: "subscribe",
      id: "1",
      payload: { query: "subscription { count }" },
    });
    expect(socket.closedWith).toBe(CloseCode.Unauthorized);
  });

  it("sends error for invalid GraphQL query", async () => {
    const schema = makeSchema(() => ({
      [Symbol.asyncIterator]: () => ({
        next: async () => ({ value: 1, done: false }),
        return: async () => ({ value: undefined, done: true }),
      }),
    }));
    const { callbacks } = setup({ schema });
    const socket = await connect(callbacks);

    await callbacks.message!(socket, {
      type: "subscribe",
      id: "1",
      payload: { query: "subscription { nonExistentField }" },
    });

    expect(socket.messages("error")).toHaveLength(1);
  });

  it("sends next + complete for a finite subscription", async () => {
    async function* finite() {
      yield 1;
      yield 2;
    }
    const schema = makeSchema(finite);
    const { callbacks } = setup({ schema });
    const socket = await connect(callbacks);

    await callbacks.message!(socket, {
      type: "subscribe",
      id: "s1",
      payload: { query: "subscription { count }" },
    });

    // handleAsyncIterator runs in the background — wait for it to drain.
    await wait(20);

    expect(socket.messages("next").map((m) => (m.payload as { data: { count: number } }).data.count)).toEqual([1, 2]);
    expect(socket.messages("complete")).toHaveLength(1);
  });

  it("sends error when subscription resolver throws", async () => {
    async function* boom() {
      yield 1;
      throw new Error("boom");
    }
    const schema = makeSchema(boom);
    const { callbacks } = setup({ schema });
    const socket = await connect(callbacks);

    await callbacks.message!(socket, {
      type: "subscribe",
      id: "e1",
      payload: { query: "subscription { count }" },
    });

    // handleAsyncIterator runs in the background — wait for the error to propagate.
    await wait(20);

    expect(socket.messages("error")).toHaveLength(1);
  });
});

// ─── complete (client-side cancellation) ─────────────────────────────────────

describe("complete", () => {
  it("cancels a hanging subscription via complete message", async () => {
    let returnCalled = false;
    let resolveHang: (() => void) | undefined;

    const iter: AsyncIterator<number> = {
      async next() {
        // Hang until return() is called
        await new Promise<void>((r) => { resolveHang = r; });
        return { value: undefined as unknown as number, done: true };
      },
      async return() {
        returnCalled = true;
        resolveHang?.();
        return { value: undefined as unknown as number, done: true };
      },
    };

    const schema = makeSchema(() => ({
      [Symbol.asyncIterator]: () => iter,
    }));

    const { callbacks } = setup({ schema });
    const socket = await connect(callbacks);

    // Start subscription (will hang)
    const subPromise = callbacks.message!(socket, {
      type: "subscribe",
      id: "hang",
      payload: { query: "subscription { count }" },
    });

    // Give the loop time to call iter.next() and block
    await wait(10);

    // Cancel from client side
    await callbacks.message!(socket, { type: "complete", id: "hang" });
    await subPromise;

    expect(returnCalled).toBe(true);
  });
});

// ─── Abort on disconnect ───────────────────────────────────────────────────────

describe("abort on disconnect", () => {
  it("exits the iterator immediately when connection closes (no wait for next value)", async () => {
    let returnCalled = false;
    let resolveHang: (() => void) | undefined;
    let valuesYielded = 0;

    const iter: AsyncIterator<number> = {
      async next() {
        if (valuesYielded === 0) {
          valuesYielded++;
          return { value: 42, done: false };
        }
        // Subsequent calls hang
        await new Promise<void>((r) => { resolveHang = r; });
        return { value: undefined as unknown as number, done: true };
      },
      async return() {
        returnCalled = true;
        resolveHang?.();
        return { value: undefined as unknown as number, done: true };
      },
    };

    const schema = makeSchema(() => ({
      [Symbol.asyncIterator]: () => iter,
    }));

    const { callbacks } = setup({ schema });
    const socket = await connect(callbacks);

    // Start subscription (will hang after first value)
    const subPromise = callbacks.message!(socket, {
      type: "subscribe",
      id: "hang",
      payload: { query: "subscription { count }" },
    });

    // Let the first value arrive
    await wait(10);
    expect(socket.messages("next")).toHaveLength(1);

    // Close the connection — must unblock the hanging next() immediately
    callbacks.close!(socket);
    await subPromise;

    expect(returnCalled).toBe(true);
    // No complete should have been sent (aborted, not finished naturally)
    expect(socket.messages("complete")).toHaveLength(0);
  });
});

// ─── execute() error resilience ──────────────────────────────────────────────

describe("execute error resilience", () => {
  it("continues delivering messages after a resolver throws (error in result, not lost)", async () => {
    let callCount = 0;
    async function* counter() {
      yield 1;
      yield 2;
      yield 3;
    }

    // Resolver that throws on the second call
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: "Query",
        fields: { _: { type: GraphQLString, resolve: () => null } },
      }),
      subscription: new GraphQLObjectType({
        name: "Subscription",
        fields: {
          count: {
            type: GraphQLInt,
            subscribe: counter,
            resolve: (val: unknown) => {
              callCount++;
              if (callCount === 2) {
                throw new Error("transient failure");
              }
              return val;
            },
          },
        },
      }),
    });

    const { callbacks } = setup({ schema });
    const socket = await connect(callbacks);

    await callbacks.message!(socket, {
      type: "subscribe",
      id: "res",
      payload: { query: "subscription { count }" },
    });

    await wait(50);

    // All 3 events are delivered as "next" messages. The resolver error for
    // event 2 is included in the payload's errors array, NOT as a separate
    // "error" protocol message. This is correct GraphQL behaviour: execute()
    // catches resolver errors and includes them in the ExecutionResult.
    const nexts = socket.messages("next");
    expect(nexts.length).toBe(3);
    expect((nexts[0].payload as { data: { count: number } }).data.count).toBe(1);
    // Second event: resolver threw → data.count is null, errors present
    expect((nexts[1].payload as { data: { count: number | null } }).data.count).toBeNull();
    expect((nexts[1].payload as { errors?: unknown[] }).errors).toBeDefined();
    expect((nexts[2].payload as { data: { count: number } }).data.count).toBe(3);
    // Subscription survived the error — "complete" sent after iterator exhausted
    expect(socket.messages("complete")).toHaveLength(1);
  });
});

// ─── safeSend resilience ──────────────────────────────────────────────────────

describe("safeSend", () => {
  it("does not throw when socket.send raises an error", async () => {
    async function* one() { yield 1; }
    const schema = makeSchema(one);
    const { callbacks } = setup({ schema });

    const socket = await connect(callbacks);
    // Make send throw after init (simulating a closed transport)
    socket.send = () => { throw new Error("WebSocket is closed"); };

    // Should not throw or reject
    let error: unknown;
    try {
      await callbacks.message!(socket, {
        type: "subscribe",
        id: "x",
        payload: { query: "subscription { count }" },
      });
    } catch (e) {
      error = e;
    }
    expect(error).toBeUndefined();
  });
});

// ─── Server-side keepalive ──────────────────────────────────────────────────

describe("keepAlive", () => {
  it("sends periodic ping messages after connection_init", async () => {
    const { callbacks } = setup({ wsOptions: { keepAlive: 20 } });
    const socket = await connect(callbacks);

    // Wait for at least 2 keepalive pings
    await wait(55);
    callbacks.close!(socket);

    expect(socket.messages("ping").length).toBeGreaterThanOrEqual(2);
  });

  it("stops pings after connection closes", async () => {
    const { callbacks } = setup({ wsOptions: { keepAlive: 20 } });
    const socket = await connect(callbacks);

    await wait(30);
    callbacks.close!(socket);
    const countAfterClose = socket.messages("ping").length;

    await wait(40);
    expect(socket.messages("ping").length).toBe(countAfterClose);
  });

  it("does not send pings when keepAlive is false", async () => {
    const { callbacks } = setup({ wsOptions: { keepAlive: false } });
    const socket = await connect(callbacks);

    await wait(50);
    callbacks.close!(socket);

    expect(socket.messages("ping")).toHaveLength(0);
  });

  it("does not send pings when keepAlive is 0", async () => {
    const { callbacks } = setup({ wsOptions: { keepAlive: 0 } });
    const socket = await connect(callbacks);

    await wait(50);
    callbacks.close!(socket);

    expect(socket.messages("ping")).toHaveLength(0);
  });
});
