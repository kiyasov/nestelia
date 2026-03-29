import { Controller, Get, Post } from "elysia-nest";
import { Body } from "elysia-nest";
import { webhookListSchema, webhookRequestSchema } from "./dto";

@Controller("/webhooks")
export class WebhooksController {
  @Get()
  findAll(@Body(webhookListSchema) body: any): void {}

  @Post()
  create(@Body(webhookRequestSchema) body: any): void {}
}
