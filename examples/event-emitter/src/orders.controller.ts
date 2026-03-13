import { t, type Static } from "elysia";

import { Body, Controller, Get, Param, Post } from "nestelia";

import { OrdersService } from "./orders.service";

const CreateOrderBody = t.Object({ product: t.String(), amount: t.Number(), email: t.String() });
const IdParams = t.Object({ id: t.String() });

@Controller("/orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get("/")
  findAll() {
    return this.ordersService.findAll();
  }

  @Post("/")
  async create(@Body(CreateOrderBody) body: Static<typeof CreateOrderBody>) {
    return this.ordersService.create(body.product, body.amount, body.email);
  }

  @Post("/:id/ship")
  async ship(@Param(IdParams) params: Static<typeof IdParams>) {
    const order = await this.ordersService.ship(params.id);
    if (!order) return { error: "Order not found" };
    return order;
  }
}
