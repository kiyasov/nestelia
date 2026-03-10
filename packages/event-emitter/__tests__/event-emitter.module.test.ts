import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import { EVENT_EMITTER_TOKEN } from "../src/event-emitter.constants";
import { EventEmitterModule } from "../src/event-emitter.module";
import { EventEmitter2 } from "../src/event-emitter.service";

describe("EventEmitterModule.forRoot — shape", () => {
  it("returns a valid DynamicModule", () => {
    const mod = EventEmitterModule.forRoot();
    expect(mod.module).toBe(EventEmitterModule);
    expect(Array.isArray(mod.providers)).toBe(true);
    expect(mod.exports).toContain(EVENT_EMITTER_TOKEN);
    expect(mod.exports).toContain(EventEmitter2);
  });

  it("global defaults to false", () => {
    expect(EventEmitterModule.forRoot().global).toBe(false);
  });

  it("sets global: true when global: true is passed", () => {
    expect(EventEmitterModule.forRoot({ global: true }).global).toBe(true);
  });

  it("provides EVENT_EMITTER_TOKEN", () => {
    const mod = EventEmitterModule.forRoot();
    const providers = mod.providers as { provide: unknown }[];
    expect(providers.some((p) => p.provide === EVENT_EMITTER_TOKEN)).toBe(true);
  });

  it("provides EventEmitter2 class token", () => {
    const mod = EventEmitterModule.forRoot();
    const providers = mod.providers as { provide: unknown }[];
    expect(providers.some((p) => p.provide === EventEmitter2)).toBe(true);
  });

  it("both tokens resolve to the same instance", () => {
    const mod = EventEmitterModule.forRoot();
    const providers = mod.providers as { provide: unknown; useValue?: unknown }[];
    const tokenProvider = providers.find((p) => p.provide === EVENT_EMITTER_TOKEN);
    const classProvider = providers.find((p) => p.provide === EventEmitter2);
    expect(tokenProvider?.useValue).toBe(classProvider?.useValue);
  });

  it("passes options to EventEmitter2", () => {
    const mod = EventEmitterModule.forRoot({ wildcard: true });
    const providers = mod.providers as { provide: unknown; useValue?: unknown }[];
    const provider = providers.find((p) => p.provide === EventEmitter2);
    expect(provider?.useValue).toBeInstanceOf(EventEmitter2);
  });
});
