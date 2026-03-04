import { Injectable } from "@kiyasov/elysia-nest";
import { RabbitMQService } from "../../../packages/rabbitmq/src";
import { Inject } from "@kiyasov/elysia-nest";

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
