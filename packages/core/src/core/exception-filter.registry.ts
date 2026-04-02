/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ExceptionContext, ExceptionFilter } from "../exceptions";
import { CATCH_EXCEPTIONS_METADATA } from "../exceptions/catch.decorator";

const _globalExceptionFilters: ExceptionFilter[] = [];

export function clearGlobalExceptionFilters(): void {
  _globalExceptionFilters.length = 0;
}

export function addGlobalExceptionFilter(filter: ExceptionFilter): void {
  _globalExceptionFilters.push(filter);
}

export async function applyExceptionFilters(ctx: {
  error: unknown;
  request: Request;
  set: { status: number; headers: Record<string, string> };
  path: string;
}): Promise<unknown> {
  if (!_globalExceptionFilters.length) {
    return;
  }

  const error = ctx.error;
  if (!error) {
    return;
  }

  const exception = error instanceof Error ? error : new Error(String(error));
  const context: ExceptionContext = {
    request: ctx.request,
    response: undefined,
    set: ctx.set,
    path: ctx.path,
    method: ctx.request.method,
  };

  for (const filterInstance of _globalExceptionFilters) {
    const metadata = (Reflect.getMetadata(CATCH_EXCEPTIONS_METADATA, filterInstance.constructor) ||
      Reflect.getMetadata("__filterCatchExceptions__", filterInstance.constructor)) as
      | Array<new (...args: unknown[]) => Error>
      | undefined;

    const catchesAll =
      !metadata || metadata.length === 0 || metadata.some((type) => exception instanceof type);

    if (catchesAll) {
      const result = await filterInstance.catch(exception, context);
      if (result !== undefined) {
        return result;
      }
    }
  }
}
