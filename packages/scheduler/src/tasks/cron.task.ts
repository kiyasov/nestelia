import { CronJob } from "cron";

import type { CronExpression } from "../interfaces/cron.interface";
import type {
  CronTaskOptions,
  TaskCallback,
} from "../interfaces/scheduler.interface";
import { ScheduledTaskBase } from "./task.base";

/**
 * A task that fires on a cron schedule.
 *
 * Wraps the `cron` package's `CronJob`. The underlying job is started
 * immediately on construction and stopped when {@link cancel} is called.
 *
 * @example
 * ```typescript
 * const task = new CronTask("0 * * * *", () => doWork(), { name: "hourly" });
 * // … later …
 * task.cancel();
 * ```
 */
export class CronTask extends ScheduledTaskBase {
  private cronJob: CronJob | null = null;

  constructor(
    private readonly cronExpression: string | CronExpression,
    callback: TaskCallback,
    private readonly options: CronTaskOptions = {},
  ) {
    super(callback, options.name);
    this.start();
  }

  private start(): void {
    const expression =
      typeof this.cronExpression === "string"
        ? this.cronExpression
        : this.cronExpression.toString();

    this.cronJob = new CronJob(
      expression,
      () => {
        // executeCallback already guards against _canceled; no need to call
        // cancel() here — the cron library will stop firing once stop() is
        // called from cancel().
        void this.executeCallback();
      },
      null, // onComplete
      true, // start immediately
      this.options.timeZone,
    );

    if (this.options.executeOnInit) {
      void this.executeCallback();
    }
  }

  /** Stops the cron job and releases the callback reference. */
  public cancel(): void {
    if (this._canceled) return;

    this.cronJob?.stop();
    this.cronJob = null;

    this._canceled = true;
    this.releaseCallback();
  }
}
