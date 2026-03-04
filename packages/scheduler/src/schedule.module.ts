import { Module } from "@kiyasov/elysia-nest";
import type { Provider } from "@kiyasov/elysia-nest";
import {
  Scheduler,
  SchedulerConfig,
  SchedulerRegistry,
} from "./services/scheduler.service";

/**
 * Dynamic module configuration
 */
export interface DynamicModule {
  module: unknown;
  global?: boolean;
  providers?: Provider[];
  exports?: unknown[];
}

/**
 * Module configuration options
 */
export interface ScheduleModuleOptions {
  /**
   * Maximum number of tasks allowed (default: 10000)
   */
  maxTasks?: number;
}

/**
 * Module for scheduling tasks (cron, interval, timeout)
 */
@Module({})
export class ScheduleModule {
  /**
   * Configure the scheduling module with default options
   */
  static forRoot(): DynamicModule {
    return ScheduleModule.forRootWithOptions({});
  }

  /**
   * Configure the scheduling module with custom options
   */
  static forRootWithOptions(options: ScheduleModuleOptions): DynamicModule {
    const config: SchedulerConfig = {
      maxTasks: options.maxTasks,
    };

    const schedulerProvider: Provider = {
      provide: Scheduler,
      useFactory: () => new Scheduler(config),
    };

    const registryProvider: Provider = {
      provide: SchedulerRegistry,
      useFactory: () => new SchedulerRegistry(),
    };

    return {
      module: ScheduleModule,
      global: true,
      providers: [schedulerProvider, registryProvider],
      exports: [Scheduler, SchedulerRegistry],
    };
  }
}
