import type { CronExpression } from "./cron.interface";

/**
 * Task options for scheduled tasks
 */
export interface SchedulerTaskOptions {
  /**
   * Task name for identification
   */
  name?: string;

  /**
   * Whether to execute the task immediately upon registration
   */
  executeOnInit?: boolean;

  /**
   * Timeout in milliseconds
   */
  timeout?: number;
}

/**
 * Options for cron tasks
 */
export interface CronTaskOptions extends SchedulerTaskOptions {
  /**
   * Timezone for the cron expression
   */
  timeZone?: string;
}

/**
 * Options for interval tasks
 */
export interface IntervalTaskOptions extends SchedulerTaskOptions {
  /**
   * Whether to stop the interval when the application is shutting down
   */
  stopOnShutdown?: boolean;
}

/**
 * Options for timeout tasks
 */
export interface TimeoutTaskOptions extends SchedulerTaskOptions {
  /**
   * Whether to cancel the timeout when the application is shutting down
   */
  cancelOnShutdown?: boolean;
}

/**
 * Task handle for controlling scheduled tasks
 */
export interface TaskHandle {
  /**
   * Unique task identifier
   */
  id: string;

  /**
   * Task name
   */
  name: string;

  /**
   * Cancel the task
   */
  cancel(): void;

  /**
   * Check if the task is canceled
   */
  isCanceled(): boolean;
}

/**
 * Base interface for a scheduled task
 */
export interface ScheduledTask {
  /**
   * Unique task identifier
   */
  id: string;

  /**
   * Task name
   */
  name: string;

  /**
   * Cancel the task
   */
  cancel(): void;

  /**
   * Check if the task is canceled
   */
  isCanceled(): boolean;

  /**
   * Get task handle
   */
  getHandle(): TaskHandle;
}

/**
 * Type for task callback function
 */
export type TaskCallback = () => Promise<void> | void;

/**
 * The scheduler interface defining scheduling operations
 */
export interface IScheduler {
  /**
   * Schedule a task to run at a cron time
   */
  scheduleCron(
    cronExpression: string | CronExpression,
    callback: TaskCallback,
    options?: CronTaskOptions,
  ): TaskHandle;

  /**
   * Schedule a task to run at fixed intervals
   */
  scheduleInterval(
    intervalMs: number,
    callback: TaskCallback,
    options?: IntervalTaskOptions,
  ): TaskHandle;

  /**
   * Schedule a task to run once after a delay
   */
  scheduleTimeout(
    delayMs: number,
    callback: TaskCallback,
    options?: TimeoutTaskOptions,
  ): TaskHandle;

  /**
   * Schedule a task to run at a specific date
   */
  scheduleAt(
    date: Date,
    callback: TaskCallback,
    options?: TimeoutTaskOptions,
  ): TaskHandle;

  /**
   * Cancel all scheduled tasks
   */
  cancelAllTasks(): void;

  /**
   * Get all active tasks
   */
  getTasks(): TaskHandle[];
}
