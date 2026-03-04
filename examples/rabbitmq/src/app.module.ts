import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";
import { RabbitMQModule } from "../../../packages/rabbitmq/src";

import { OrdersHandler } from "./orders.handler";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    RabbitMQModule.forRoot({
      urls: [process.env.RABBITMQ_URL ?? "amqp://localhost:5672"],
      exchanges: [
        {
          name: "orders",
          type: "topic",
          options: { durable: true },
          createIfNotExists: true,
        },
      ],
    }),
  ],
  providers: [OrdersHandler, OrdersService],
})
export class AppModule {}
