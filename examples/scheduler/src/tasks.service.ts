import { Injectable } from "@kiyasov/elysia-nest";
import { Cron, Interval, Timeout } from "../../../packages/scheduler/src";

@Injectable()
export class TasksService {
  readonly log: string[] = [];

  @Cron("*/5 * * * * *")
  handleEvery5Seconds() {
    this.log.push(`cron:${Date.now()}`);
  }

  @Interval(10_000)
  handleEvery10Seconds() {
    this.log.push(`interval:${Date.now()}`);
  }

  @Timeout(30_000)
  handleOnce() {
    this.log.push(`timeout:${Date.now()}`);
  }
}
