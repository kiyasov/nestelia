import { Scheduler } from "../services/scheduler.service";

/*
 * Singleton container for the scheduler
 */
class SchedulerContainer {
  private static instance: SchedulerContainer;
  private readonly scheduler: Scheduler;

  private constructor() {
    this.scheduler = new Scheduler();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SchedulerContainer {
    if (!SchedulerContainer.instance) {
      SchedulerContainer.instance = new SchedulerContainer();
    }
    return SchedulerContainer.instance;
  }

  /**
   * Get the scheduler
   */
  public getScheduler(): Scheduler {
    return this.scheduler;
  }
}

/**
 * Get the global scheduler instance
 */
export function getScheduler(): Scheduler {
  return SchedulerContainer.getInstance().getScheduler();
}
