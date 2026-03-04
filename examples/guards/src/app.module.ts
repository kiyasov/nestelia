import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";

import { AuthGuard } from "./auth.guard";
import { ProtectedController, PublicController } from "./protected.controller";
import { RolesGuard } from "./roles.guard";

@Module({
  controllers: [PublicController, ProtectedController],
  providers: [AuthGuard, RolesGuard],
})
export class AppModule {}
