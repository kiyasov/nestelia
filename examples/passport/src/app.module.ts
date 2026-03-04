import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";

import { AuthController } from "./auth.controller";
import { BearerStrategy } from "./bearer.strategy";

@Module({
  controllers: [AuthController],
  providers: [BearerStrategy],
})
export class AppModule {}
