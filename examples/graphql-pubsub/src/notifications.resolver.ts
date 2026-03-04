import { Injectable } from "@kiyasov/elysia-nest";
import {
  Args,
  Mutation,
  Query,
  Resolver,
  Subscription,
} from "../../../packages/apollo/src";
import {
  GRAPHQL_PUBSUB,
} from "../../../packages/graphql-pubsub/src";
import type { RedisPubSub } from "../../../packages/graphql-pubsub/src";
import { Inject } from "@kiyasov/elysia-nest";

import { Notification } from "./notification.type";

const NOTIFICATION_ADDED = "NOTIFICATION_ADDED";

@Resolver(() => Notification)
@Injectable()
export class NotificationsResolver {
  private counter = 0;

  constructor(
    @Inject(GRAPHQL_PUBSUB) private readonly pubSub: RedisPubSub,
  ) {}

  @Query(() => String)
  ping(): string {
    return "pong";
  }

  @Mutation(() => Notification)
  async sendNotification(
    @Args("message") message: string,
  ): Promise<Notification> {
    const notification: Notification = {
      id: ++this.counter,
      message,
      createdAt: new Date().toISOString(),
    };
    await this.pubSub.publish(NOTIFICATION_ADDED, {
      notificationAdded: notification,
    });
    return notification;
  }

  @Subscription(() => Notification, {
    resolve: (payload: { notificationAdded: Notification }) =>
      payload.notificationAdded,
  })
  notificationAdded() {
    return this.pubSub.asyncIterator(NOTIFICATION_ADDED);
  }
}
