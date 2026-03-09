import "reflect-metadata";

import { Module } from "nestelia";
import { ScheduleModule } from "../../../packages/scheduler/src";

import { TasksService } from "./tasks.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TasksService],
})
export class AppModule {}
