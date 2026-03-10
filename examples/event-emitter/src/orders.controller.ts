import { Body, Controller, Get, Param, Post } from "nestelia";

import { OrdersService } from "./orders.service";

@Controller("/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get("/")
  findAll() {
    return this.ordersService.findAll();
  }

  @Post("/")
  async create(@Body() body: { product: string; amount: number; email: string }) {
    return this.ordersService.create(body.product, body.amount, body.email);
  }

  @Post("/:id/ship")
  async ship(@Param("id") id: string) {
    const order = await this.ordersService.ship(id);
    if (!order) return { error: "Order not found" };
    return order;
  }
}
