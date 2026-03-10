import { Injectable } from "nestelia";
import { randomUUID } from "node:crypto";

import { EventEmitter2 } from "../../../packages/event-emitter/src";
import type { Order } from "./schema";

@Injectable()
export class OrdersService {
  private readonly orders: Order[] = [];

  constructor(private readonly events: EventEmitter2) {}

  async create(product: string, amount: number, email: string): Promise<Order> {
    const order: Order = { id: randomUUID(), product, amount, email };
    this.orders.push(order);

    await this.events.emitAsync("order.created", order);
    return order;
  }

  async ship(id: string): Promise<Order | undefined> {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return undefined;

    await this.events.emitAsync("order.shipped", order);
    return order;
  }

  findAll(): Order[] {
    return this.orders;
  }
}
