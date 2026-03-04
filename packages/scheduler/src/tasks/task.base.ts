import { randomUUID } from "node:crypto";

import type {
  ScheduledTask,
  TaskCallback,
  TaskHandle,
} from "../interfaces/scheduler.interface";
import { packageLogger } from "../logger";

/**
 * Abstract base class for all scheduled task types.
 *
 * Provides a unique ID, a human-readable name, cancellation state, and a
 * safe {@link executeCallback} wrapper that catches and logs errors so an
 * unhandled rejection from a task callback never crashes the process.
 */
export abstract class ScheduledTaskBase implements ScheduledTask {
  /** Cryptographically random unique task identifier. */
  public readonly id: string;

  /** Human-readable task name. Defaults to `task-<first-8-chars-of-id>`. */
  public readonly name: string;

  /** `true` once {@link cancel} has been called. */
  protected _canceled = false;

  /**
   * Stored callback reference.
   * Nullified after cancellation so the closure and its captured variables
   * can be garbage-collected.
   */
  protected callback: TaskCallback | null;

  constructor(callback: TaskCallback, name?: string) {
    this.id = randomUUID();
    this.name = name || `task-${this.id.substring(0, 8)}`;
    this.callback = callback;
  }

  /** Nullifies the callback reference to release captured memory. */
  protected releaseCallback(): void {
    this.callback = null;
  }

  /** Stops the task. Implementations must set {@link _canceled} to `true`. */
  public abstract cancel(): void;

  /** Returns `true` if the task has been cancelled. */
  public isCanceled(): boolean {
    return this._canceled;
  }

  /**
   * Returns a lightweight {@link TaskHandle} that exposes only the public
   * control surface (`id`, `name`, `cancel`, `isCanceled`).
   */
  public getHandle(): TaskHandle {
    return {
      id: this.id,
      name: this.name,
      cancel: this.cancel.bind(this),
      isCanceled: this.isCanceled.bind(this),
    };
  }

  /**
   * Invokes the task callback, catching and logging any thrown error.
   *
   * No-ops silently when the task is already cancelled or the callback has
   * been released.
   */
  protected async executeCallback(): Promise<void> {
    if (this._canceled || !this.callback) return;

    try {
      await Promise.resolve(this.callback());
    } catch (error) {
      packageLogger.error(`Error executing task "${this.name}":`, error);
    }
  }
}
