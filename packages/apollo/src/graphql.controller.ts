import { HeaderMap } from "@apollo/server";
import type { Context, Elysia } from "elysia";

import { ApolloService } from "./services";
import { processMultipartRequest } from "./upload";

/** Apollo Server HTTP response structure. */
interface ApolloHTTPResponse {
  /** HTTP status code. */
  status?: number;
  /** Response headers. */
  headers: HeaderMap;
  /** Response body (complete or chunked). */
  body:
    | { kind: "complete"; string: string }
    | { kind: "chunked"; asyncIterator: AsyncIterableIterator<string> };
}

/** Apollo Server with HTTP execution capability. */
interface ApolloServerWithHTTP {
  /**
   * Executes a GraphQL HTTP request.
   * @param opts - Request options including HTTP request and context.
   * @returns HTTP response.
   */
  executeHTTPGraphQLRequest(opts: {
    httpGraphQLRequest: {
      method: string;
      headers: HeaderMap;
      search: string;
      body?: unknown;
    };
    context: () => Promise<unknown>;
  }): Promise<ApolloHTTPResponse>;
}

/** CORS headers for GraphQL endpoints. */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
} as const;

/**
 * Registers GraphQL HTTP routes on the Elysia application.
 * Handles GET, POST, and OPTIONS requests for the GraphQL endpoint.
 *
 * @param app - Elysia application instance.
 * @param apolloService - Apollo service instance.
 * @param path - GraphQL endpoint path.
 *
 * @example
 * ```typescript
 * const app = new Elysia();
 * const apolloService = new ApolloService(options, app);
 * await apolloService.start();
 * registerGraphQLRoutes(app, apolloService, '/graphql');
 * ```
 */
export function registerGraphQLRoutes(
  app: Elysia,
  apolloService: ApolloService,
  path: string,
): void {
  const handler = async (ctx: Context): Promise<Response> => {
    const apolloServer = apolloService.getServer();
    if (!apolloServer) {
      return new Response("Apollo Server not initialized", { status: 503 });
    }

    const { request } = ctx;
    const method = request.method.toUpperCase();

    // WebSocket upgrade requests are handled by Elysia WS, skip here
    if (method === "GET") {
      const upgradeHeader = request.headers.get("upgrade");
      if (upgradeHeader?.toLowerCase() === "websocket") {
        return undefined as unknown as Response;
      }
    }

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const headerMap = new HeaderMap();
    request.headers.forEach((value, key) => headerMap.set(key, value));

    const body = method === "POST" ? await extractBody(ctx) : undefined;

    const httpResponse = await (
      apolloServer as unknown as ApolloServerWithHTTP
    ).executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method,
        headers: headerMap,
        search: new URL(request.url).search,
        body,
      },
      context: async () => apolloService.createContext(ctx),
    });

    const responseHeaders = new Headers(CORS_HEADERS);
    httpResponse.headers.forEach((value, key) =>
      responseHeaders.set(key, value),
    );

    const responseBody =
      httpResponse.body.kind === "complete"
        ? httpResponse.body.string
        : await drainChunked(httpResponse.body.asyncIterator);

    return new Response(responseBody, {
      status: httpResponse.status ?? 200,
      headers: responseHeaders,
    });
  };

  // Register routes for all HTTP methods
  app.get(path, handler);
  app.post(path, handler);
  app.options(path, handler);
}

/**
 * Extracts the request body from the Elysia context.
 * Handles multipart/form-data for file uploads and JSON payloads.
 *
 * @param ctx - Elysia context with request and body.
 * @returns Parsed body or undefined.
 */
async function extractBody(ctx: {
  request: Request;
  body: unknown;
}): Promise<unknown> {
  const contentType = ctx.request.headers.get("content-type") ?? "";
  const ctxBody = ctx.body;

  if (
    contentType.includes("multipart/form-data") &&
    typeof ctxBody === "object" &&
    ctxBody
  ) {
    return processMultipartRequest(
      ctxBody as FormData | Record<string, unknown>,
    );
  }

  if (typeof ctxBody === "object" && ctxBody && !Array.isArray(ctxBody)) {
    return ctxBody;
  }

  try {
    return await ctx.request.clone().json();
  } catch {
    return undefined;
  }
}

/**
 * Drains a chunked async iterator into a single string.
 *
 * @param iter - Async iterator of string chunks.
 * @returns Concatenated string.
 */
async function drainChunked(
  iter: AsyncIterableIterator<string>,
): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of iter) {
    chunks.push(chunk);
  }
  return chunks.join("");
}
