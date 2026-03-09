import { Controller, Get } from "nestelia";
import {
  CACHE_MANAGER,
  CacheKey,
  CacheTTL,
} from "../../../packages/cache/src";
import { Inject } from "nestelia";

import { ProductsService } from "./products.service";

@Controller("/products")
export class ProductsController {
  constructor(
    private readonly products: ProductsService,
    @Inject(CACHE_MANAGER) private readonly cache: any,
  ) {}

  @Get("/")
  @CacheKey("products-list")
  @CacheTTL(30)
  async getAll() {
    return this.products.findAll();
  }

  @Get("/manual-cache")
  async manualCache() {
    const cached = await this.cache.get("manual-key");
    if (cached) return { source: "cache", data: cached };

    const data = await this.products.findAll();
    await this.cache.set("manual-key", data, 60);
    return { source: "db", data };
  }

  @Get("/stats")
  stats() {
    return { dbCalls: this.products.getCallCount() };
  }
}
