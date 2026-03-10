import { Injectable } from "nestelia";

import { OnEvent } from "../../../packages/event-emitter/src";
import type { Order } from "./schema";

@Injectable()
export class NotificationListener {
  private readonly log: string[] = [];

  /** Fires only for order.created */
  @OnEvent("order.created")
  handleOrderCreated(order: Order): void {
    const msg = `[Email] Order ${order.id} confirmed — sending to ${order.email}`;
    this.log.push(msg);
    console.log(msg);
  }

  /** Fires only for order.shipped */
  @OnEvent("order.shipped")
  handleOrderShipped(order: Order): void {
    const msg = `[Email] Order ${order.id} shipped — notifying ${order.email}`;
    this.log.push(msg);
    console.log(msg);
  }

  /** Wildcard — fires for every order.* event */
  @OnEvent("order.*")
  handleAnyOrderEvent(order: Order): void {
    const msg = `[Audit] Order event for ${order.id}`;
    this.log.push(msg);
    console.log(msg);
  }

  getLog(): string[] {
    return this.log;
  }
}
