import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import { AuthGuard } from "../../../packages/passport/src";

describe("AuthGuard", () => {
  it("creates a guard class for a named strategy", () => {
    const Guard = AuthGuard("mock");
    expect(Guard).toBeDefined();
    expect(typeof Guard).toBe("function");
  });

  it("guard instances have canActivate method", () => {
    const Guard = AuthGuard("mock");
    const instance = new Guard();
    expect(typeof instance.canActivate).toBe("function");
  });

  it("different strategy names produce different guards", () => {
    const JwtGuard = AuthGuard("jwt");
    const LocalGuard = AuthGuard("local");
    expect(JwtGuard).not.toBe(LocalGuard);
  });
});
