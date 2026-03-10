import "reflect-metadata";

import { Module } from "nestelia";

import { EventEmitterModule } from "../../../packages/event-emitter/src";
import { NotificationListener } from "./notification.listener";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true, global: true }),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, NotificationListener],
})
export class AppModule {}
