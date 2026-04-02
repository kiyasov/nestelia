import type { OnModuleDestroy } from "nestelia";
import type { CronExpression } from "../interfaces/cron.interface";
import { isValidCronExpression } from "../interfaces/cron.interface";
import type {
  CronTaskOptions,
  IntervalTaskOptions,
  IScheduler,
  TaskCallback,
  TaskHandle,
  TimeoutTaskOptions,
} from "../interfaces/scheduler.interface";
import { CronTask, IntervalTask, TimeoutTask } from "../tasks";

/**
 * Configuration options for Scheduler
 */
export interface SchedulerConfig {
  /**
   * Maximum number of tasks allowed (default: 10000)
   */
  maxTasks?: number;
}

/**
 * Service for scheduling tasks
 */
export class Scheduler implements IScheduler, OnModuleDestroy {
  /**
   * Map of all active tasks
   */
  private readonly tasks: Map<string, TaskHandle> = new Map();

  /**
   * Maximum number of tasks allowed
   */
  private readonly maxTasks: number;

  /**
   * Counter for operations to trigger cleanup
   */
  private operationCount = 0;

  /**
   * Create a new scheduler
   */
  constructor(config: SchedulerConfig = {}) {
    this.maxTasks = config.maxTasks ?? 10000;
  }

  onModuleDestroy(): void {
    this.cancelAllTasks();
  }

  /**
   * Check if task limit is reached
   */
  private checkTaskLimit(): void {
    if (this.tasks.size >= this.maxTasks) {
      throw new Error(
        `Task limit exceeded: maximum ${this.maxTasks} tasks allowed`,
      );
    }
  }

  /**
   * Trigger cleanup periodically
   */
  private maybeCleanup(): void {
    this.operationCount++;
    // Cleanup every 100 operations or when map is getting large
    if (
      this.operationCount % 100 === 0 ||
      this.tasks.size > this.maxTasks * 0.8
    ) {
      this.cleanupCanceledTasks();
    }
  }

  /**
   * Schedule a task to run at a cron time
   */
  public scheduleCron(
    cronExpression: string | CronExpression,
    callback: TaskCallback,
    options: CronTaskOptions = {},
  ): TaskHandle {
    this.maybeCleanup();
    this.checkTaskLimit();

    if (
      typeof cronExpression === "string" &&
      !isValidCronExpression(cronExpression)
    ) {
      throw new Error(`Invalid cron expression: ${cronExpression}`);
    }

    const task = new CronTask(cronExpression, callback, options);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);

    return handle;
  }

  /**
   * Schedule a task to run at fixed intervals
   */
  public scheduleInterval(
    intervalMs: number,
    callback: TaskCallback,
    options: IntervalTaskOptions = {},
  ): TaskHandle {
    this.maybeCleanup();
    this.checkTaskLimit();

    if (intervalMs <= 0) {
      throw new Error(`Invalid interval: ${intervalMs}ms`);
    }

    const task = new IntervalTask(intervalMs, callback, options);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);

    return handle;
  }

  /**
   * Schedule a task to run once after a delay
   */
  public scheduleTimeout(
    delayMs: number,
    callback: TaskCallback,
    options: TimeoutTaskOptions = {},
  ): TaskHandle {
    this.maybeCleanup();
    this.checkTaskLimit();

    if (delayMs < 0) {
      throw new Error(`Invalid delay: ${delayMs}ms`);
    }

    // Create cleanup callback to remove task from map after completion
    const onComplete = (): void => {
      this.tasks.delete(handle.id);
    };

    const task = new TimeoutTask(delayMs, callback, options, onComplete);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);

    return handle;
  }

  /**
   * Schedule a task to run at a specific date
   */
  public scheduleAt(
    date: Date,
    callback: TaskCallback,
    options: TimeoutTaskOptions = {},
  ): TaskHandle {
    this.maybeCleanup();
    this.checkTaskLimit();

    const now = new Date();
    const delay = date.getTime() - now.getTime();

    if (delay < 0) {
      throw new Error(`Cannot schedule task in the past: ${date}`);
    }

    // Create cleanup callback to remove task from map after completion
    const onComplete = (): void => {
      this.tasks.delete(handle.id);
    };

    const task = new TimeoutTask(delay, callback, options, onComplete);
    const handle = task.getHandle();
    this.tasks.set(handle.id, handle);

    return handle;
  }

  /**
   * Cancel all scheduled tasks
   */
  public cancelAllTasks(): void {
    for (const handle of this.tasks.values()) {
      handle.cancel();
    }

    this.tasks.clear();
  }

  /**
   * Get all active tasks
   */
  public getTasks(): TaskHandle[] {
    return Array.from(this.tasks.values()).filter(
      (handle) => !handle.isCanceled(),
    );
  }

  /**
   * Remove tasks that are canceled
   */
  private cleanupCanceledTasks(): void {
    for (const [id, handle] of this.tasks.entries()) {
      if (handle.isCanceled()) {
        this.tasks.delete(id);
      }
    }
  }
}

/**
 * Registry for managing multiple schedulers
 */
export class SchedulerRegistry implements OnModuleDestroy {
  private readonly schedulers: Map<string, Scheduler> = new Map();

  onModuleDestroy(): void {
    this.clear();
  }

  /**
   * Add a scheduler to the registry
   */
  public addScheduler(name: string, scheduler: Scheduler): void {
    this.schedulers.set(name, scheduler);
  }

  /**
   * Get a scheduler by name
   */
  public getScheduler(name: string): Scheduler | undefined {
    return this.schedulers.get(name);
  }

  /**
   * Remove a scheduler from the registry
   */
  public removeScheduler(name: string): void {
    const scheduler = this.schedulers.get(name);
    if (scheduler) {
      scheduler.cancelAllTasks();
      this.schedulers.delete(name);
    }
  }

  /**
   * Get all scheduler names
   */
  public getSchedulerNames(): string[] {
    return Array.from(this.schedulers.keys());
  }

  /**
   * Clear all schedulers
   */
  public clear(): void {
    for (const scheduler of this.schedulers.values()) {
      scheduler.cancelAllTasks();
    }
    this.schedulers.clear();
  }
}
