import "reflect-metadata";

import { Module } from "nestelia";

import { TodoController } from "./todo.controller";
import { TodoService } from "./todo.service";

@Module({
  controllers: [TodoController],
  providers: [TodoService],
})
export class AppModule {}
