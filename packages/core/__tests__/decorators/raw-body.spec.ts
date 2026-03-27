import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

import { setupController } from "~/src/core/controller-setup";
import { Module } from "~/src/core/module.decorator";
import { Controller } from "~/src/decorators/controller.decorator";
import { Headers as HeadersDecorator, Post, RawBody } from "~/src/decorators/http.decorators";
import { Container, DIContainer } from "~/src/di";
import { Injectable } from "~/src/di/injectable.decorator";

// ── Fixtures ──────────────────────────────────────────────────────────────────

@Injectable()
@Controller("/webhook")
class WebhookController {
  received: unknown = undefined;

  @Post("/stripe")
  handleStripe(@RawBody() body: string) {
    this.received = body;
    return { ok: true };
  }

  @Post("/with-header")
  handleWithHeader(@HeadersDecorator("x-signature") sig: string, @RawBody() body: string) {
    this.received = { sig, body };
    return { ok: true };
  }

  @Post("/json")
  handleJson() {
    return { ok: true };
  }
}

@Injectable()
@Controller("/plain")
class PlainController {
  received: unknown = undefined;

  @Post("/data")
  handleData() {
    return { ok: true };
  }
}

@Module({
  providers: [WebhookController, PlainController],
  controllers: [WebhookController, PlainController],
})
class TestModule {}

// ── Integration tests: parse hook ─────────────────────────────────────────────
// @RawBody() must install a route-level parse hook so Elysia skips its global
// JSON parser and delivers the body as a plain string.

describe("@RawBody() — parse hook integration", () => {
  let app: Elysia;
  let controller: WebhookController;

  beforeEach(async () => {
    Container.instance.clear();
    DIContainer.register([WebhookController, PlainController], TestModule as any);
    DIContainer.registerControllers([WebhookController, PlainController], TestModule as any);

    app = new Elysia();
    await setupController(app, WebhookController, TestModule, "");
    await setupController(app, PlainController, TestModule, "");

    controller = (await DIContainer.get<WebhookController>(
      WebhookController,
      TestModule as any,
    ))!;
  });

  afterEach(() => {
    Container.instance.clear();
  });

  it("delivers body as raw string when sending JSON with application/json content-type", async () => {
    const payload = '{"event":"payment_intent.succeeded","amount":4200}';

    const response = await app.handle(
      new Request("http://localhost/webhook/stripe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
      }),
    );

    expect(response.status).toBe(200);
    expect(typeof controller.received).toBe("string");
    expect(controller.received).toBe(payload);
  });

  it("body is a plain string, not a parsed object", async () => {
    const payload = '{"type":"customer.created"}';

    await app.handle(
      new Request("http://localhost/webhook/stripe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
      }),
    );

    // Must NOT be an object — the parse hook must prevent JSON auto-parsing
    expect(controller.received).not.toBeInstanceOf(Object);
    expect(controller.received).toBe(payload);
  });

  it("delivers body as raw string with text/plain content-type", async () => {
    const payload = "t=1234,v1=abc,v2=def";

    await app.handle(
      new Request("http://localhost/webhook/stripe", {
        method: "POST",
        headers: { "content-type": "text/plain" },
        body: payload,
      }),
    );

    expect(controller.received).toBe(payload);
  });

  it("passes both header value and raw body when used alongside @Headers()", async () => {
    const payload = '{"event":"charge.succeeded"}';
    const sig = "t=1234,v1=abc";

    await app.handle(
      new Request("http://localhost/webhook/with-header", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-signature": sig,
        },
        body: payload,
      }),
    );

    const received = controller.received as { sig: string; body: string };
    expect(received.sig).toBe(sig);
    expect(received.body).toBe(payload);
    expect(typeof received.body).toBe("string");
  });
});
