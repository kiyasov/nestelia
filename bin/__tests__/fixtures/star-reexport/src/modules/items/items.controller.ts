import { Controller, Post } from "elysia-nest";
import { Body } from "elysia-nest";
import { createItemSchema } from "./index";

@Controller("/items")
export class ItemsController {
  @Post()
  create(@Body(createItemSchema) body: any): void {}
}
