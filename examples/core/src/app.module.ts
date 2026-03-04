import "reflect-metadata";

import { Module } from "@kiyasov/elysia-nest";

import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";

@Module({
  controllers: [TodoController],
  providers: [TodoService],
})
export class AppModule {}
