import type { Context as ElysiaContextType } from "elysia";

import type { ParamMetadata } from "../decorators/types";
import { DIContainer, type Type } from "../di";
import type { ExecutionContext } from "../interfaces/execution-context.interface";

function createElysiaExecutionContext(
  elysiaContext: ElysiaContextType,
): ExecutionContext {
  return {
    getClass: <T = unknown>() => undefined as T,
    getHandler: () => () => undefined,
    getArgByIndex: <T = unknown>(index: number) =>
      ([elysiaContext.request, elysiaContext, elysiaContext.set] as unknown[])[
        index
      ] as T,
    getArgs: <T extends unknown[] = unknown[]>() =>
      [elysiaContext.request, elysiaContext, elysiaContext.set] as unknown as T,
    getType: <T extends string = string>() => "http" as T,
    switchToHttp: () => ({
      getRequest: <T = unknown>() => elysiaContext as T,
      getResponse: <T = unknown>() => elysiaContext.set as T,
      getNext: <T = unknown>() => undefined as T,
    }),
    switchToRpc: () => ({
      getData: <T = unknown>() => undefined as T,
      getContext: <T = unknown>() => elysiaContext as T,
    }),
    switchToWs: () => ({
      getData: <T = unknown>() => undefined as T,
      getClient: <T = unknown>() => undefined as T,
      getPattern: <T = unknown>() => undefined as T,
    }),
  };
}

export async function resolveParam(
  paramMeta: ParamMetadata | undefined,
  paramType: unknown,
  elysiaContext: ElysiaContextType,
  moduleinstance?: Type<unknown>,
): Promise<unknown> {
  if (paramMeta) {
    const data = paramMeta.data as string | undefined;
    if (paramMeta.type === "__factory__" && paramMeta.factory) {
      return await paramMeta.factory(
        data,
        createElysiaExecutionContext(elysiaContext),
      );
    }
    switch (paramMeta.type) {
      case "body":
        return data
          ? elysiaContext.body
            ? (elysiaContext.body as Record<string, unknown>)[data]
            : undefined
          : elysiaContext.body || {};
      case "param":
        return data
          ? elysiaContext.params
            ? elysiaContext.params[data]
            : undefined
          : elysiaContext.params || {};
      case "query":
        return data
          ? elysiaContext.query
            ? elysiaContext.query[data]
            : undefined
          : elysiaContext.query || {};
      case "request":
      case "req":
        return elysiaContext.request;
      case "response":
      case "res":
        return elysiaContext.set;
      case "context":
      case "ctx":
      case "elysiaContext":
        return elysiaContext;
      case "headers":
        return data
          ? elysiaContext.request.headers.get(data)
          : elysiaContext.request.headers;
      case "ip":
        return (
          elysiaContext.request.headers.get("x-forwarded-for") ||
          (elysiaContext as unknown as { ip?: string }).ip
        );
      default:
        break;
    }
  }

  // If no explicit param metadata provided, attempt to resolve via DI
  if (paramType && paramType !== Object && moduleinstance) {
    try {
      return await DIContainer.get(
        paramType as Type<unknown>,
        moduleinstance as Type<unknown>,
      );
    } catch {
      return undefined;
    }
  }

  return undefined;
}
