import "reflect-metadata";

import type { CronExpression } from "../interfaces/cron.interface";
import type {
  CronTaskOptions,
  IntervalTaskOptions,
  TimeoutTaskOptions,
} from "../interfaces/scheduler.interface";

// Constants for scheduler metadata
export const SCHEDULED_JOBS_METADATA = "custom:scheduled_jobs";

/**
 * Scheduled job types
 */
export enum ScheduledJobType {
  CRON = "cron",
  INTERVAL = "interval",
  TIMEOUT = "timeout",
  DATE = "date",
}

/**
 * Scheduled job metadata
 */
export interface ScheduledJobMetadata {
  /**
   * Type of job
   */
  type: ScheduledJobType;

  /**
   * Method name to call
   */
  methodName: string | symbol;

  /**
   * Job configuration
   */
  config: unknown;

  /**
   * Job options
   */
  options?: unknown;
}

/**
 * Decorator for cron jobs
 */
export function Cron(
  cronExpression: string | CronExpression,
  options?: CronTaskOptions,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    const jobs =
      Reflect.getMetadata(SCHEDULED_JOBS_METADATA, target.constructor) || [];

    jobs.push({
      type: ScheduledJobType.CRON,
      methodName: propertyKey,
      config: cronExpression,
      options,
    });

    Reflect.defineMetadata(SCHEDULED_JOBS_METADATA, jobs, target.constructor);

    return descriptor;
  };
}

/**
 * Decorator for interval jobs
 */
export function Interval(
  milliseconds: number,
  options?: IntervalTaskOptions,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    const jobs =
      Reflect.getMetadata(SCHEDULED_JOBS_METADATA, target.constructor) || [];

    jobs.push({
      type: ScheduledJobType.INTERVAL,
      methodName: propertyKey,
      config: milliseconds,
      options,
    });

    Reflect.defineMetadata(SCHEDULED_JOBS_METADATA, jobs, target.constructor);

    return descriptor;
  };
}

/**
 * Decorator for timeout jobs
 */
export function Timeout(
  milliseconds: number,
  options?: TimeoutTaskOptions,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    const jobs =
      Reflect.getMetadata(SCHEDULED_JOBS_METADATA, target.constructor) || [];

    jobs.push({
      type: ScheduledJobType.TIMEOUT,
      methodName: propertyKey,
      config: milliseconds,
      options,
    });

    Reflect.defineMetadata(SCHEDULED_JOBS_METADATA, jobs, target.constructor);

    return descriptor;
  };
}

/**
 * Decorator for scheduled jobs at a specific date
 */
export function ScheduleAt(
  date: Date,
  options?: TimeoutTaskOptions,
): MethodDecorator {
  return <T>(
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<T>,
  ): TypedPropertyDescriptor<T> | void => {
    const jobs =
      Reflect.getMetadata(SCHEDULED_JOBS_METADATA, target.constructor) || [];

    jobs.push({
      type: ScheduledJobType.DATE,
      methodName: propertyKey,
      config: date,
      options,
    });

    Reflect.defineMetadata(SCHEDULED_JOBS_METADATA, jobs, target.constructor);

    return descriptor;
  };
}
