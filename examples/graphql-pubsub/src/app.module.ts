import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";
import { GraphQLModule } from "../../../packages/apollo/src";
import { GraphQLPubSubModule } from "../../../packages/graphql-pubsub/src";

import { NotificationsResolver } from "./notifications.resolver";

@Module({
  imports: [
    GraphQLPubSubModule.forRoot({
      useValue: {
        connection: {
          host: process.env.REDIS_HOST ?? "localhost",
          port: Number(process.env.REDIS_PORT ?? 6379),
        },
      },
    }),
    GraphQLModule.forRoot({
      path: "/graphql",
      autoSchemaFile: true,
      playground: true,
      subscriptions: {
        "graphql-ws": true,
      },
    }),
  ],
  providers: [NotificationsResolver],
})
export class AppModule {}
