import "reflect-metadata";

import { afterEach, describe, expect, it } from "bun:test";
import type { ExecutionContext } from "nestelia";
import { AuthGuard } from "../src/auth.guard";
import { clearStrategyRegistries } from "../src/passport-strategy";

afterEach(() => {
  clearStrategyRegistries();
});

function makeContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request, getResponse: () => undefined }),
    switchToRpc: () => ({ getData: () => undefined, getContext: () => undefined }),
    switchToWs: () => ({ getData: () => undefined, getClient: () => undefined }),
    getClass: <T>() => Object as unknown as T,
    getHandler: () => () => {},
    getArgByIndex: () => undefined,
    getArgs: () => [],
    getType: () => "http" as const,
  } as unknown as ExecutionContext;
}

describe("AuthGuard", () => {
  describe("factory", () => {
    it("returns a class", () => {
      const Guard = AuthGuard("jwt");
      expect(typeof Guard).toBe("function");
    });

    it("creates instances with canActivate", () => {
      const Guard = AuthGuard("jwt");
      const guard = new Guard();
      expect(typeof guard.canActivate).toBe("function");
    });
  });

  describe("getRequest", () => {
    it("returns raw request when no nesting", () => {
      const Guard = AuthGuard();
      const guard = new Guard();
      const req = { method: "GET" };
      expect(guard.getRequest(makeContext(req))).toBe(req);
    });

    it("unwraps .ctx", () => {
      const Guard = AuthGuard();
      const guard = new Guard();
      const inner = { path: "/" };
      expect(guard.getRequest(makeContext({ ctx: inner }))).toBe(inner);
    });

    it("unwraps .request", () => {
      const Guard = AuthGuard();
      const guard = new Guard();
      const inner = { path: "/" };
      expect(guard.getRequest(makeContext({ request: inner }))).toBe(inner);
    });

    it("unwraps .req", () => {
      const Guard = AuthGuard();
      const guard = new Guard();
      const inner = { path: "/" };
      expect(guard.getRequest(makeContext({ req: inner }))).toBe(inner);
    });
  });

  describe("handleRequest", () => {
    it("returns user when no error", () => {
      const Guard = AuthGuard();
      const guard = new Guard();
      const user = { id: 1 };
      expect(guard.handleRequest(null, user)).toBe(user);
    });

    it("throws error when err is set", () => {
      const Guard = AuthGuard();
      const guard = new Guard();
      const err = new Error("Unauthorized");
      expect(() => guard.handleRequest(err, null)).toThrow("Unauthorized");
    });
  });
});
