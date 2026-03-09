import { Injectable } from "nestelia";
import { RabbitSubscribe } from "../../../packages/rabbitmq/src";

export interface OrderCreatedEvent {
  orderId: string;
  amount: number;
  userId: string;
}

@Injectable()
export class OrdersHandler {
  readonly processed: OrderCreatedEvent[] = [];

  @RabbitSubscribe({
    exchange: "orders",
    routingKey: "order.created",
    queue: "orders-created-queue",
  })
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.processed.push(event);
    console.log(`[orders] Processing order ${event.orderId} — $${event.amount}`);
  }
}
