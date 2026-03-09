import { Injectable } from "nestelia";
import { RabbitMQService } from "../../../packages/rabbitmq/src";
import { Inject } from "nestelia";

@Injectable()
export class OrdersService {
  constructor(
    @Inject(RabbitMQService) private readonly rabbit: RabbitMQService,
  ) {}

  async createOrder(amount: number, userId: string) {
    const orderId = crypto.randomUUID();
    await this.rabbit.publish("orders", "order.created", {
      orderId,
      amount,
      userId,
    });
    return { orderId };
  }
}
