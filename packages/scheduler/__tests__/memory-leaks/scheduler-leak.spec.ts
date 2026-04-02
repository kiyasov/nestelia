import "reflect-metadata";

import { afterEach, describe, expect, it } from "bun:test";

import { Scheduler, SchedulerRegistry } from "../../src";

/**
 * Memory leak test: Scheduler tasks and SchedulerRegistry.
 *
 * Issues documented:
 * 1. CronTasks use cron library CronJob — if not cancelled, they run forever
 * 2. IntervalTasks use setInterval — persists until clearInterval
 * 3. No onApplicationShutdown hook to auto-cancel tasks
 * 4. SchedulerRegistry can accumulate schedulers without bound
 */
describe("Scheduler — memory leak", () => {
  let scheduler: Scheduler;

  afterEach(() => {
    scheduler?.cancelAllTasks();
  });

  it("should hold task references in map after creation", () => {
    scheduler = new Scheduler();

    const tasks: ReturnType<typeof scheduler.scheduleInterval>[] = [];

    for (let i = 0; i < 50; i++) {
      tasks.push(
        scheduler.scheduleInterval(100_000, () => {}, {
          name: `task-${i}`,
        }),
      );
    }

    // All tasks are stored in the internal map
    expect(scheduler.getTasks().length).toBe(50);
  });

  it("should not auto-cleanup cancelled tasks until periodic sweep", () => {
    scheduler = new Scheduler();

    // Create and cancel tasks
    for (let i = 0; i < 50; i++) {
      const task = scheduler.scheduleInterval(100_000, () => {}, {
        name: `task-${i}`,
      });
      task.cancel();
    }

    // getTasks() filters cancelled, but internal map still has entries
    // until maybeCleanup runs (every 100 operations or at 80% capacity)
    expect(scheduler.getTasks().length).toBe(0);
  });

  it("should demonstrate interval tasks run without shutdown hook", async () => {
    scheduler = new Scheduler();

    let count = 0;
    scheduler.scheduleInterval(
      50,
      () => {
        count++;
      },
      { name: "leaky-interval" },
    );

    await new Promise((resolve) => setTimeout(resolve, 200));

    // Task continues running — in a real app without proper shutdown,
    // this prevents process exit and leaks memory.
    expect(count).toBeGreaterThanOrEqual(3);

    // Manual cleanup required
    scheduler.cancelAllTasks();
  });
});

describe("SchedulerRegistry — memory leak", () => {
  it("should accumulate schedulers without bound", () => {
    const registry = new SchedulerRegistry();

    for (let i = 0; i < 100; i++) {
      registry.addScheduler(`scheduler-${i}`, new Scheduler());
    }

    expect(registry.getSchedulerNames().length).toBe(100);

    // Must call clear() explicitly — no lifecycle hook
    registry.clear();
    expect(registry.getSchedulerNames().length).toBe(0);
  });

  it("should cancel tasks when removing a scheduler", () => {
    const registry = new SchedulerRegistry();
    const scheduler = new Scheduler();

    scheduler.scheduleInterval(100_000, () => {}, { name: "test" });
    registry.addScheduler("main", scheduler);

    expect(scheduler.getTasks().length).toBe(1);

    registry.removeScheduler("main");

    expect(scheduler.getTasks().length).toBe(0);
  });
});
