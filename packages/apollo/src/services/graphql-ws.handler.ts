import type { Elysia } from "elysia";
import type { ElysiaWS } from "elysia/ws";
import type { GraphQLSchema } from "graphql";
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
}

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
    this.connections.set(socket.id, {
      socket,
      context: {
        connectionParams: {},
        headers: {},
        request: undefined,
      },
      isInitialized: false,
      subscriptions: new Map(),
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
        socket.send(JSON.stringify({ type: "pong" }));
        break;
      }

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

    state.isInitialized = true;
    socket.send(JSON.stringify({ type: "connection_ack" }));
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
    const { subscribe, parse, validate } = await import("graphql");

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

    const result = await subscribe({
      schema: this.schema,
      document,
      contextValue,
      variableValues: message.payload.variables,
      operationName: message.payload.operationName,
    });

    if (Symbol.asyncIterator in result || Symbol.iterator in result) {
      await this.handleAsyncIterator(
        state,
        message.id,
        result as AsyncIterable<unknown>,
      );
    } else {
      this.sendNext(state.socket, message.id, result);
      this.sendComplete(state.socket, message.id);
    }
  }

  private async handleAsyncIterator(
    state: ConnectionState,
    id: string,
    iterator: AsyncIterable<unknown>,
  ): Promise<void> {
    const abortController = new AbortController();
    state.subscriptions.set(id, abortController);

    try {
      for await (const value of iterator) {
        if (abortController.signal.aborted) {
          break;
        }
        this.sendNext(state.socket, id, value);
      }
      this.sendComplete(state.socket, id);
    } catch (err) {
      this.sendError(state.socket, id, [{ message: String(err) }]);
    } finally {
      state.subscriptions.delete(id);
    }
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

  private sendNext(socket: WsSocket, id: string, payload: unknown): void {
    socket.send(JSON.stringify({ type: "next", id, payload }));
  }

  private sendComplete(socket: WsSocket, id: string): void {
    socket.send(JSON.stringify({ type: "complete", id }));
  }

  private sendError(
    socket: WsSocket,
    id: string,
    payload: Array<{ message: string }>,
  ): void {
    socket.send(JSON.stringify({ type: "error", id, payload }));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
