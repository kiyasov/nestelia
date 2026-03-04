import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { MathService } from "./math.service";

describe("MathService", () => {
  let service: MathService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MathService],
    }).compile();

    service = module.get(MathService);
  });

  it("adds two numbers", () => {
    const result = service.add({ a: 3, b: 4 });
    expect(result).toEqual({ result: 7 });
  });

  it("multiplies two numbers", () => {
    const result = service.multiply({ a: 6, b: 7 });
    expect(result).toEqual({ result: 42 });
  });

  it("handles negative numbers", () => {
    expect(service.add({ a: -5, b: 3 })).toEqual({ result: -2 });
    expect(service.multiply({ a: -3, b: 4 })).toEqual({ result: -12 });
  });

  it("handles zero", () => {
    expect(service.add({ a: 0, b: 0 })).toEqual({ result: 0 });
    expect(service.multiply({ a: 5, b: 0 })).toEqual({ result: 0 });
  });
});
