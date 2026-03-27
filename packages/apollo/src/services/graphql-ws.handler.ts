import type { Elysia } from "elysia";
import type { ElysiaWS } from "elysia/ws";
import {
  createSourceEventStream,
  execute,
  parse,
  validate,
  type ExecutionArgs,
  type GraphQLSchema,
} from "graphql";
import {
  CloseCode,
  type ConnectionInitMessage,
  type SubscribeMessage,
} from "graphql-ws";

import type {
  ApolloContext,
  ApolloOptions,
  GraphQLWsContext,
  GraphQLWsSubscriptionsOptions,
} from "../interfaces";

/** Elysia instance with WebSocket support. */
interface ElysiaWithWs {
  /** Registers a WebSocket handler at the given path. */
  ws(path: string, options: WsHandlerOptions): unknown;
}

/** WebSocket connection context. */
interface WsContext {
  /** HTTP request object. */
  request?: Request;
}

type WsSocket = ElysiaWS<WsContext>;

/** WebSocket handler options. */
interface WsHandlerOptions {
  /** Callback when a connection is opened. */
  open?: (socket: WsSocket) => void;
  /** Callback when a message is received. */
  message?: (socket: WsSocket, message: unknown) => void | Promise<void>;
  /** Callback when a connection is closed. */
  close?: (socket: WsSocket) => void;
}

/** State for a WebSocket connection. */
interface ConnectionState {
  /** WebSocket socket instance. */
  socket: WsSocket;
  /** GraphQL context for this connection. */
  context: GraphQLWsContext;
  /** Whether the connection has been initialized. */
  isInitialized: boolean;
  /** Active subscriptions for this connection. */
  subscriptions: Map<string, AbortController>;
  /** Timer for connectionInitWaitTimeout (cleared after init). */
  initTimer?: ReturnType<typeof setTimeout>;
  /** Interval for server-side keepalive pings (cleared on close). */
  keepAliveInterval?: ReturnType<typeof setInterval>;
}

/** Default timeout to wait for connection_init before closing (ms). */
const DEFAULT_INIT_TIMEOUT_MS = 3_000;

/** Default server-side keep-alive interval (ms). */
const DEFAULT_KEEP_ALIVE_MS = 12_000;

/**
 * Handler for GraphQL WebSocket subscriptions using the graphql-ws protocol.
 * Manages connections, message processing, and subscription execution.
 */
export class GraphQLWsHandler {
  private readonly connections = new Map<string, ConnectionState>();
  private readonly schema: GraphQLSchema;
  private readonly wsOptions: GraphQLWsSubscriptionsOptions;
  private readonly apolloOptions: ApolloOptions;
  private readonly elysiaApp: Elysia & ElysiaWithWs;

  /**
   * Creates a new GraphQLWsHandler.
   * @param schema - The GraphQL schema.
   * @param wsOptions - WebSocket subscription options.
   * @param apolloOptions - Apollo server options.
   * @param elysiaApp - Elysia application instance.
   */
  constructor(
    schema: GraphQLSchema,
    wsOptions: GraphQLWsSubscriptionsOptions,
    apolloOptions: ApolloOptions,
    elysiaApp: Elysia,
  ) {
    this.schema = schema;
    this.wsOptions = wsOptions;
    this.apolloOptions = apolloOptions;
    this.elysiaApp = elysiaApp as Elysia & ElysiaWithWs;
  }

  /**
   * Registers the WebSocket handler at the given path.
   * @param path - WebSocket endpoint path.
   */
  register(path: string): void {
    this.elysiaApp.ws(path, {
      open: (socket) => this.handleOpen(socket),
      message: (socket, message) => this.handleMessage(socket, message),
      close: (socket) => this.handleClose(socket),
    });
  }

  private handleOpen(socket: WsSocket): void {
    const timeoutMs =
      this.wsOptions.connectionInitWaitTimeout ?? DEFAULT_INIT_TIMEOUT_MS;

    const initTimer = setTimeout(() => {
      const state = this.connections.get(socket.id);
      if (state && !state.isInitialized) {
        socket.close(CloseCode.ConnectionInitialisationTimeout);
      }
    }, timeoutMs);

    this.connections.set(socket.id, {
      socket,
      context: {
        connectionParams: {},
        headers: {},
        request: undefined,
      },
      isInitialized: false,
      subscriptions: new Map(),
      initTimer,
    });
  }

  private async handleMessage(
    socket: WsSocket,
    rawMessage: unknown,
  ): Promise<void> {
    const state = this.connections.get(socket.id);
    if (!state) {
      return;
    }

    const message = this.parseMessage(rawMessage);
    if (!message) {
      socket.close(CloseCode.BadRequest);
      return;
    }

    await this.processMessage(message, state, socket);
  }

  private handleClose(socket: WsSocket): void {
    const state = this.connections.get(socket.id);
    if (state) {
      clearTimeout(state.initTimer);
      clearInterval(state.keepAliveInterval);
      for (const sub of state.subscriptions.values()) {
        sub.abort();
      }
      this.wsOptions.onDisconnect?.(state.context);
      this.connections.delete(socket.id);
    }
  }

  private parseMessage(
    rawMessage: unknown,
  ): { type: string; [key: string]: unknown } | undefined {
    try {
      if (
        typeof rawMessage === "object" &&
        rawMessage !== null &&
        "type" in rawMessage
      ) {
        return rawMessage as { type: string; [key: string]: unknown };
      }
      if (typeof rawMessage === "string") {
        return JSON.parse(rawMessage);
      }
      return JSON.parse(String(rawMessage));
    } catch {
      return undefined;
    }
  }

  private async processMessage(
    message: { type: string; [key: string]: unknown },
    state: ConnectionState,
    socket: WsSocket,
  ): Promise<void> {
    switch (message.type) {
      case "connection_init": {
        await this.handleConnectionInit(
          message as unknown as ConnectionInitMessage,
          state,
          socket,
        );
        break;
      }

      case "subscribe": {
        await this.handleSubscribe(
          message as unknown as SubscribeMessage,
          state,
          socket,
        );
        break;
      }

      case "complete": {
        const id = String(message.id);
        const sub = state.subscriptions.get(id);
        if (sub) {
          sub.abort();
          state.subscriptions.delete(id);
        }
        break;
      }

      case "ping": {
        const payload = (message as { payload?: unknown }).payload;
        const pong = payload !== undefined ? { type: "pong", payload } : { type: "pong" };
        this.safeSend(socket, JSON.stringify(pong));
        break;
      }

      case "pong":
        // Client response to server-sent ping — no action needed.
        break;

      default:
        socket.close(CloseCode.BadRequest);
    }
  }

  private async handleConnectionInit(
    initMsg: ConnectionInitMessage,
    state: ConnectionState,
    socket: WsSocket,
  ): Promise<void> {
    const connectionParams = this.isRecord(initMsg.payload)
      ? initMsg.payload
      : {};

    state.context.connectionParams = connectionParams;
    state.context.request = socket.data?.request;
    state.context.headers = socket.data?.request
      ? Object.fromEntries(socket.data.request.headers.entries())
      : {};

    if (this.wsOptions.onConnect) {
      try {
        await this.wsOptions.onConnect(state.context);
      } catch {
        socket.close(CloseCode.Forbidden);
        return;
      }
    }

    clearTimeout(state.initTimer);
    state.isInitialized = true;
    this.safeSend(socket, JSON.stringify({ type: "connection_ack" }));
    this.startKeepAlive(state);
  }

  private startKeepAlive(state: ConnectionState): void {
    const intervalMs = this.wsOptions.keepAlive;
    // Disabled explicitly with `false` or `0`.
    if (intervalMs === false || intervalMs === 0) {
      return;
    }
    const ms = typeof intervalMs === "number" ? intervalMs : DEFAULT_KEEP_ALIVE_MS;
    state.keepAliveInterval = setInterval(() => {
      this.safeSend(state.socket, JSON.stringify({ type: "ping" }));
    }, ms);
  }

  private async handleSubscribe(
    subscribeMsg: SubscribeMessage,
    state: ConnectionState,
    socket: WsSocket,
  ): Promise<void> {
    if (!state.isInitialized) {
      socket.close(CloseCode.Unauthorized);
      return;
    }

    try {
      await this.executeSubscription(subscribeMsg, state);
    } catch (err) {
      this.sendError(socket, subscribeMsg.id, [{ message: String(err) }]);
    }
  }

  private async executeSubscription(
    message: SubscribeMessage,
    state: ConnectionState,
  ): Promise<void> {
    const contextValue = await this.buildContext(
      state.context.request,
      state.context.connectionParams ?? {},
    );

    const document = parse(message.payload.query);
    const validationErrors = validate(this.schema, document);
    if (validationErrors.length > 0) {
      this.sendError(
        state.socket,
        message.id,
        validationErrors.map((e) => ({ message: e.message })),
      );
      return;
    }

    const subscribeArgs = {
      schema: this.schema,
      document,
      contextValue,
      variableValues: message.payload.variables ?? undefined,
      operationName: message.payload.operationName ?? undefined,
    };

    // Use createSourceEventStream instead of subscribe() to get the raw
    // event stream without graphql-js's mapAsyncIterator wrapper.
    // This avoids a critical issue where mapAsyncIterator calls
    // iterator.return() (killing the subscription permanently) when
    // execute() throws for a single event.
    const resultOrStream = await createSourceEventStream(subscribeArgs);

    if (
      typeof resultOrStream === "object" &&
      resultOrStream !== null &&
      Symbol.asyncIterator in resultOrStream
    ) {
      // Run the subscription loop in the background so the message handler
      // is not blocked and can process subsequent messages (ping, complete,
      // new subscriptions) on the same connection.
      void this.handleAsyncIterator(
        state,
        message.id,
        resultOrStream as AsyncIterable<unknown>,
        subscribeArgs,
      );
    } else {
      // Error result from createSourceEventStream.
      this.sendNext(state.socket, message.id, resultOrStream);
      this.sendComplete(state.socket, message.id);
    }
  }

  private async handleAsyncIterator(
    state: ConnectionState,
    id: string,
    iterable: AsyncIterable<unknown>,
    subscribeArgs: ExecutionArgs,
  ): Promise<void> {
    const abortController = new AbortController();
    state.subscriptions.set(id, abortController);

    const iter = iterable[Symbol.asyncIterator]();
    try {
      while (!abortController.signal.aborted) {
        // Race the next value against the abort signal so the loop exits
        // immediately on disconnect without waiting for the next event.
        const next = await this.nextOrAbort(iter, abortController.signal);
        if (next === null || abortController.signal.aborted) {
          break;
        }
        if (next.done) {
          this.sendComplete(state.socket, id);
          return;
        }

        // Map the source event to a GraphQL response by running execute().
        // Errors are sent to the client but do NOT kill the subscription —
        // unlike graphql-js's mapAsyncIterator which calls iterator.return()
        // on the first execute() error, permanently destroying the stream.
        try {
          const result = await execute({
            ...subscribeArgs,
            rootValue: next.value,
          });
          this.sendNext(state.socket, id, result);
        } catch (err) {
          if (!abortController.signal.aborted) {
            this.sendError(state.socket, id, [{ message: String(err) }]);
          }
        }
      }
    } catch (err) {
      if (!abortController.signal.aborted) {
        this.sendError(state.socket, id, [{ message: String(err) }]);
      }
    } finally {
      // Signal the upstream publisher to release resources.
      try {
        await iter.return?.();
      } catch {
        // ignore errors from iterator cleanup
      }
      // Only delete if this is still OUR abort controller (guards against
      // a race where the client sent "complete" + re-subscribed with the
      // same ID before our finally block ran).
      if (state.subscriptions.get(id) === abortController) {
        state.subscriptions.delete(id);
      }
    }
  }

  /**
   * Returns the next iterator result or `null` if the abort signal fires first.
   */
  private nextOrAbort(
    iter: AsyncIterator<unknown>,
    signal: AbortSignal,
  ): Promise<IteratorResult<unknown> | null> {
    return new Promise<IteratorResult<unknown> | null>((resolve, reject) => {
      if (signal.aborted) {
        resolve(null);
        return;
      }

      const onAbort = (): void => resolve(null);
      signal.addEventListener("abort", onAbort, { once: true });

      iter.next().then(
        (result) => {
          signal.removeEventListener("abort", onAbort);
          resolve(result);
        },
        (err: unknown) => {
          signal.removeEventListener("abort", onAbort);
          reject(err as Error);
        },
      );
    });
  }

  private async buildContext(
    request: Request | undefined,
    connectionParams: Record<string, unknown>,
  ): Promise<unknown> {
    const baseContext: ApolloContext = {
      request: request ?? new Request("ws://localhost"),
      response: new Response(),
      params: {},
      store: {},
      elysiaContext: {
        connectionParams,
        headers: request ? Object.fromEntries(request.headers.entries()) : {},
        request,
      },
    };

    if (this.apolloOptions.context) {
      return this.apolloOptions.context(baseContext);
    }
    return { req: request, ctx: baseContext.elysiaContext };
  }

  /** Sends a raw string, silently ignoring errors if the socket is closed. */
  private safeSend(socket: WsSocket, data: string): void {
    try {
      socket.send(data);
    } catch {
      // socket already closed
    }
  }

  private sendNext(socket: WsSocket, id: string, payload: unknown): void {
    this.safeSend(socket, JSON.stringify({ type: "next", id, payload }));
  }

  private sendComplete(socket: WsSocket, id: string): void {
    this.safeSend(socket, JSON.stringify({ type: "complete", id }));
  }

  private sendError(
    socket: WsSocket,
    id: string,
    payload: Array<{ message: string }>,
  ): void {
    this.safeSend(socket, JSON.stringify({ type: "error", id, payload }));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
