import type {
  IntervalTaskOptions,
  TaskCallback,
} from "../interfaces/scheduler.interface";
import { ScheduledTaskBase } from "./task.base";

/**
 * A task that fires repeatedly at a fixed interval.
 *
 * The interval is started immediately on construction. Call {@link cancel}
 * to stop it.
 *
 * @example
 * ```typescript
 * const task = new IntervalTask(5_000, () => poll(), { name: "poller" });
 * // … later …
 * task.cancel();
 * ```
 */
export class IntervalTask extends ScheduledTaskBase {
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly intervalMs: number,
    callback: TaskCallback,
    private readonly options: IntervalTaskOptions = {},
  ) {
    super(callback, options.name);
    this.start();
  }

  private start(): void {
    if (this.options.executeOnInit) {
      void this.executeCallback();
    }

    this.intervalId = setInterval(() => {
      // executeCallback already guards against _canceled.
      void this.executeCallback();
    }, this.intervalMs);
  }

  /** Clears the interval and releases the callback reference. */
  public cancel(): void {
    if (this._canceled) return;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this._canceled = true;
    this.releaseCallback();
  }
}
