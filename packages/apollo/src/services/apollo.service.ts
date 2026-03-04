import { writeFileSync } from "node:fs";

import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageDisabled } from "@apollo/server/plugin/disabled";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { makeExecutableSchema } from "@graphql-tools/schema";
import type { Context as ElysiaContext, Elysia } from "elysia";
import { type GraphQLSchema, printSchema } from "graphql";

import { Container } from "@kiyasov/elysia-nest";
import type {
  ApolloContext,
  ApolloOptions,
  GraphQLWsSubscriptionsOptions,
  SubscriptionConfig,
} from "../interfaces";
import { SchemaBuilder } from "../schema-builder";
import { GraphQLWsHandler } from "./graphql-ws.handler";

/** Elysia instance with WebSocket support. */
interface ElysiaWithWs {
  /** Registers a WebSocket handler at the given path. */
  ws(path: string, options: unknown): unknown;
}

/**
 * Service for managing Apollo Server instance and GraphQL operations.
 * Handles schema resolution, server startup, context creation, and WebSocket subscriptions.
 */
export class ApolloService {
  private apolloServer?: ApolloServer;
  private readonly options: ApolloOptions;
  private readonly elysiaApp?: Elysia;

  /**
   * Creates a new ApolloService instance.
   * @param options - GraphQL configuration options.
   * @param elysiaApp - Elysia application instance (for WebSocket support).
   */
  constructor(options: ApolloOptions = {}, elysiaApp?: Elysia) {
    this.options = {
      path: "/graphql",
      playground: process.env.NODE_ENV !== "production",
      ...options,
    };
    this.elysiaApp = elysiaApp;
  }

  /**
   * Starts the Apollo Server and registers WebSocket handlers if configured.
   */
  async start(): Promise<void> {
    const schema = await this.resolveSchema();

    const plugins = this.options.playground
      ? [ApolloServerPluginLandingPageLocalDefault({ embed: true })]
      : [ApolloServerPluginLandingPageDisabled()];

    if (this.options.plugins?.length) {
      plugins.push(...(this.options.plugins as typeof plugins));
    }

    this.apolloServer = new ApolloServer({
      schema,
      introspection: true,
      csrfPrevention: false,
      plugins,
      formatError: this.options.formatError,
    });

    await this.apolloServer.start();
    this.registerGraphQLWs(schema);
  }

  /**
   * Stops the Apollo Server.
   */
  async stop(): Promise<void> {
    await this.apolloServer?.stop();
  }

  /**
   * Gets the Apollo Server instance.
   * @returns The ApolloServer instance or undefined if not started.
   */
  getServer(): ApolloServer | undefined {
    return this.apolloServer;
  }

  /**
   * Creates a GraphQL context for a request.
   * @param elysiaContext - The Elysia request context.
   * @returns The GraphQL context.
   */
  async createContext(elysiaContext: ElysiaContext): Promise<unknown> {
    const params = this.extractParams(elysiaContext);
    const store = this.extractStore(elysiaContext);

    const baseContext: ApolloContext = {
      request: elysiaContext.request,
      response: new Response(),
      params: params ?? {},
      store,
      elysiaContext,
    };

    if (this.options.context) {
      return this.options.context(baseContext);
    }

    return { req: elysiaContext.request, ctx: elysiaContext };
  }

  private extractParams(
    ctx: ElysiaContext,
  ): Record<string, string> | undefined {
    if (!this.isRecord(ctx.params)) {
      return undefined;
    }
    if (!Object.values(ctx.params).every((v) => typeof v === "string")) {
      return undefined;
    }
    return ctx.params as Record<string, string>;
  }

  private extractStore(ctx: ElysiaContext): Record<string, unknown> {
    return this.isRecord(ctx.store) ? ctx.store : {};
  }

  private async resolveSchema(): Promise<GraphQLSchema> {
    if (this.options.schema) {
      return this.options.schema;
    }

    if (this.options.autoSchemaFile) {
      return this.buildSchemaFromAutoFile();
    }

    if (this.options.typeDefs && this.options.resolvers) {
      return makeExecutableSchema({
        typeDefs: this.options.typeDefs,
        resolvers: this.options.resolvers as Parameters<
          typeof makeExecutableSchema
        >[0]["resolvers"],
      });
    }

    throw new Error(
      "GraphQL options must include 'schema', 'autoSchemaFile', or both 'typeDefs' and 'resolvers'.",
    );
  }

  private buildSchemaFromAutoFile(): GraphQLSchema {
    const builder = new SchemaBuilder(
      Container.instance,
      this.options.buildSchemaOptions,
    );
    const schema = builder.buildSchema();

    if (typeof this.options.autoSchemaFile === "string") {
      this.saveSchemaToFile(schema, this.options.autoSchemaFile);
    }

    return schema;
  }

  private saveSchemaToFile(schema: GraphQLSchema, filePath: string): void {
    const header = [
      "# ------------------------------------------------------",
      "# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)",
      "# ------------------------------------------------------",
      "",
    ].join("\n\n");
    writeFileSync(filePath, header + printSchema(schema), "utf-8");
  }

  private registerGraphQLWs(schema: GraphQLSchema): void {
    const wsOptions = this.getGraphQLWsOptions(this.options.subscriptions);
    if (!wsOptions || !this.elysiaApp || !this.hasWs(this.elysiaApp)) {
      return;
    }

    const path =
      wsOptions.path ??
      this.options.subscriptionsPath ??
      this.options.path ??
      "/graphql";

    const handler = new GraphQLWsHandler(
      schema,
      wsOptions,
      this.options,
      this.elysiaApp,
    );
    handler.register(path);
  }

  private getGraphQLWsOptions(
    subscriptions: ApolloOptions["subscriptions"],
  ): GraphQLWsSubscriptionsOptions | null {
    if (!subscriptions) {
      return null;
    }
    if (subscriptions === true) {
      return {};
    }
    const config = subscriptions as SubscriptionConfig;
    if (config["graphql-ws"] === true) {
      return {};
    }
    if (this.isRecord(config["graphql-ws"])) {
      return config["graphql-ws"] as GraphQLWsSubscriptionsOptions;
    }
    return null;
  }

  private hasWs(app: Elysia): app is Elysia & ElysiaWithWs {
    return typeof (app as unknown as ElysiaWithWs).ws === "function";
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
}
