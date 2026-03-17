import { Controller, Get, Post } from "elysia-nest";
import { Body, Query } from "elysia-nest";
import { createListingSchema } from "./dto";
import { listingQuerySchema } from "./index";

@Controller("/listings")
export class ListingsController {
  @Post()
  create(@Body(createListingSchema) body: any): void {}

  @Get()
  findAll(@Query(listingQuerySchema) query: any): void {}
}
