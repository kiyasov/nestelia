import type {
  TaskCallback,
  TimeoutTaskOptions,
} from "../interfaces/scheduler.interface";
import { ScheduledTaskBase } from "./task.base";

/**
 * Task that runs once after a delay
 */
export class TimeoutTask extends ScheduledTaskBase {
  /**
   * Node.js timeout handle
   */
  private timeoutId: NodeJS.Timeout | null = null;

  /**
   * Callback to execute when task completes
   */
  private readonly onComplete?: () => void;

  /**
   * Create a new timeout task
   */
  constructor(
    private readonly delayMs: number,
    callback: TaskCallback,
    private readonly options: TimeoutTaskOptions = {},
    onComplete?: () => void,
  ) {
    super(callback, options.name);
    this.onComplete = onComplete;
    this.start();
  }

  /**
   * Start the timeout task
   */
  private start(): void {
    // Execute immediately if specified
    if (this.options.executeOnInit) {
      try {
        this.callback?.();
      } catch {
        // swallow — same silent behaviour as executeCallback
      }
      this._canceled = true;
      this.releaseCallback();
      this.onComplete?.();
      return;
    }

    // Set up the timeout
    this.timeoutId = setTimeout(async () => {
      if (this._canceled) {
        return;
      }

      await this.executeCallback();
      this._canceled = true;
      this.timeoutId = null;
      this.onComplete?.();
    }, this.delayMs);
  }

  /**
   * Cancel the timeout task
   */
  public cancel(): void {
    if (this._canceled) {
      return;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this._canceled = true;
    this.releaseCallback();
  }
}
