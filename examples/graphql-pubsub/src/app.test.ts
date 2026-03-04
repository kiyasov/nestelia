import "reflect-metadata";

import { beforeEach, describe, expect, it, mock } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { GRAPHQL_PUBSUB } from "../../../packages/graphql-pubsub/src";
import { NotificationsResolver } from "./notifications.resolver";

// ── Mock PubSub ───────────────────────────────────────────────

const mockPubSub = {
  publish: mock(async (_trigger: string, _payload: unknown) => {}),
  asyncIterator: mock((_triggers: string | string[]) => ({
    [Symbol.asyncIterator]() {
      return this;
    },
    next: async () => ({ value: undefined, done: true }),
  })),
};

describe("NotificationsResolver", () => {
  let resolver: NotificationsResolver;

  beforeEach(async () => {
    mockPubSub.publish.mockClear();
    mockPubSub.asyncIterator.mockClear();

    const module = await Test.createTestingModule({
      providers: [
        NotificationsResolver,
        { provide: GRAPHQL_PUBSUB, useValue: mockPubSub },
      ],
    }).compile();

    resolver = module.get(NotificationsResolver);
  });

  it("ping returns pong", () => {
    expect(resolver.ping()).toBe("pong");
  });

  it("sendNotification publishes to pubsub", async () => {
    const notification = await resolver.sendNotification("Hello world");

    expect(notification.message).toBe("Hello world");
    expect(notification.id).toBe(1);
    expect(notification.createdAt).toBeDefined();
    expect(mockPubSub.publish).toHaveBeenCalledTimes(1);

    const [trigger, payload] = (mockPubSub.publish as any).mock.calls[0];
    expect(trigger).toBe("NOTIFICATION_ADDED");
    expect(payload.notificationAdded.message).toBe("Hello world");
  });

  it("assigns incrementing ids", async () => {
    const a = await resolver.sendNotification("First");
    const b = await resolver.sendNotification("Second");
    expect(b.id).toBe(a.id + 1);
  });

  it("notificationAdded returns async iterator", () => {
    const iterator = resolver.notificationAdded();
    expect(iterator).toBeDefined();
    expect(mockPubSub.asyncIterator).toHaveBeenCalledWith("NOTIFICATION_ADDED");
  });
});
