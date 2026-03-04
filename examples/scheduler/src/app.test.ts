import "reflect-metadata";

import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import { Scheduler } from "../../../packages/scheduler/src/services/scheduler.service";

describe("Scheduler", () => {
  let scheduler: Scheduler;

  beforeEach(() => {
    scheduler = new Scheduler();
  });

  afterEach(() => {
    scheduler.cancelAllTasks();
  });

  describe("Cron", () => {
    it("schedules a cron task", () => {
      const task = scheduler.scheduleCron("* * * * *", () => {}, { name: "t" });
      expect(task.name).toBe("t");
      expect(task.isCanceled()).toBe(false);
    });

    it("executes a cron task (every second)", async () => {
      let runs = 0;
      scheduler.scheduleCron("* * * * * *", () => runs++, { name: "tick" });
      await new Promise((r) => setTimeout(r, 1100));
      expect(runs).toBeGreaterThanOrEqual(1);
    });

    it("cancels a cron task", () => {
      const task = scheduler.scheduleCron("* * * * *", () => {}, { name: "t" });
      task.cancel();
      expect(task.isCanceled()).toBe(true);
    });

    it("throws on invalid cron expression", () => {
      expect(() =>
        scheduler.scheduleCron("not-a-cron", () => {}, { name: "bad" }),
      ).toThrow();
    });
  });

  describe("Interval", () => {
    it("schedules an interval task", () => {
      const task = scheduler.scheduleInterval(1000, () => {}, { name: "i" });
      expect(task.name).toBe("i");
    });

    it("fires multiple times", async () => {
      let count = 0;
      scheduler.scheduleInterval(100, () => count++, { name: "counter" });
      await new Promise((r) => setTimeout(r, 350));
      expect(count).toBeGreaterThanOrEqual(3);
    });

    it("cancels an interval", () => {
      const task = scheduler.scheduleInterval(1000, () => {}, { name: "i" });
      task.cancel();
      expect(task.isCanceled()).toBe(true);
    });

    it("throws on interval <= 0", () => {
      expect(() =>
        scheduler.scheduleInterval(0, () => {}, { name: "bad" }),
      ).toThrow();
    });
  });

  describe("Timeout", () => {
    it("executes once", async () => {
      let ran = false;
      scheduler.scheduleTimeout(50, () => { ran = true; }, { name: "once" });
      await new Promise((r) => setTimeout(r, 100));
      expect(ran).toBe(true);
    });

    it("cancels before execution", async () => {
      let ran = false;
      const task = scheduler.scheduleTimeout(200, () => { ran = true; }, { name: "cancel" });
      task.cancel();
      await new Promise((r) => setTimeout(r, 300));
      expect(ran).toBe(false);
    });
  });

  describe("Task management", () => {
    it("lists active tasks", () => {
      scheduler.scheduleCron("* * * * *", () => {}, { name: "c" });
      scheduler.scheduleInterval(1000, () => {}, { name: "i" });
      expect(scheduler.getTasks()).toHaveLength(2);
    });

    it("cancelAllTasks cancels everything", () => {
      const t1 = scheduler.scheduleCron("* * * * *", () => {}, { name: "c" });
      const t2 = scheduler.scheduleInterval(1000, () => {}, { name: "i" });
      scheduler.cancelAllTasks();
      expect(t1.isCanceled()).toBe(true);
      expect(t2.isCanceled()).toBe(true);
    });
  });
});
