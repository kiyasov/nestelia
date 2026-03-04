import { getScheduler } from "../container/scheduler.container";
import type { ScheduledJobMetadata } from "../decorators/scheduler.decorators";
import {
  SCHEDULED_JOBS_METADATA,
  ScheduledJobType,
} from "../decorators/scheduler.decorators";
import type { TaskHandle } from "../interfaces/scheduler.interface";
import { packageLogger } from "../logger";

/**
 * Property names that must never be used as method names because accessing
 * them on an arbitrary object can trigger prototype-pollution exploits.
 */
const FORBIDDEN_PROPERTY_NAMES = new Set<string | symbol>([
  "__proto__",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
  "constructor",
  "prototype",
]);

/**
 * Returns `false` for property names that could be used for prototype
 * pollution.  Allows legitimate double-underscore-prefixed names that are
 * not in the forbidden set.
 */
function isSafeMethodName(name: string | symbol): boolean {
  return !FORBIDDEN_PROPERTY_NAMES.has(name);
}

/**
 * Scans `instance` for methods decorated with {@link Cron}, {@link Interval},
 * {@link Timeout}, or {@link ScheduleAt} and registers them with the global
 * {@link Scheduler}.
 *
 * Called automatically by the DI container after a provider is instantiated.
 *
 * @returns The {@link TaskHandle} array for every successfully registered job.
 */
export function registerScheduledJobs(instance: unknown): TaskHandle[] {
  const constructor = (instance as { constructor: object }).constructor;
  const jobs: ScheduledJobMetadata[] =
    Reflect.getMetadata(SCHEDULED_JOBS_METADATA, constructor) ?? [];

  if (jobs.length === 0) return [];

  const scheduler = getScheduler();
  const taskHandles: TaskHandle[] = [];

  for (const metadata of jobs) {
    const methodName = metadata.methodName;

    // Guard against prototype-pollution via crafted metadata.
    if (!isSafeMethodName(methodName)) {
      packageLogger.warn(
        `[Scheduler] Skipping job with unsafe method name: ${String(methodName)}`,
      );
      continue;
    }

    // Traverse the full prototype chain (excluding Object.prototype) so that
    // methods defined on base classes are found correctly.
    const method = (instance as Record<string | symbol, unknown>)[methodName];
    if (typeof method !== "function") {
      packageLogger.warn(
        `[Scheduler] ${String(methodName)} is not a function on instance — skipping`,
      );
      continue;
    }

    const handler = (method as (...a: unknown[]) => unknown).bind(
      instance,
    ) as () => Promise<void> | void;

    let taskHandle: TaskHandle;

    switch (metadata.type) {
      case ScheduledJobType.CRON:
        taskHandle = scheduler.scheduleCron(
          metadata.config as string,
          handler,
          metadata.options as { timeZone?: string; name?: string },
        );
        break;

      case ScheduledJobType.INTERVAL:
        taskHandle = scheduler.scheduleInterval(
          metadata.config as number,
          handler,
          metadata.options as { stopOnShutdown?: boolean; name?: string },
        );
        break;

      case ScheduledJobType.TIMEOUT:
        taskHandle = scheduler.scheduleTimeout(
          metadata.config as number,
          handler,
          metadata.options as { cancelOnShutdown?: boolean; name?: string },
        );
        break;

      case ScheduledJobType.DATE:
        taskHandle = scheduler.scheduleAt(
          metadata.config as Date,
          handler,
          metadata.options as { cancelOnShutdown?: boolean; name?: string },
        );
        break;

      default:
        packageLogger.warn(
          `[Scheduler] Unknown job type "${String(metadata.type)}" — skipping`,
        );
        continue;
    }

    packageLogger.log(
      `[Scheduler] Registered ${metadata.type} job: ${taskHandle.name}`,
    );
    taskHandles.push(taskHandle);
  }

  return taskHandles;
}
