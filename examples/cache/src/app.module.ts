import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";
import { CacheModule } from "../../../packages/cache/src";

import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

@Module({
  imports: [CacheModule.forRoot({ ttl: 60 })],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class AppModule {}
