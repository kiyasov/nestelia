import type { LogLevel } from "./logger.interface";

export const isLogLevelEnabled = (
  targetLevel: LogLevel,
  logLevels: LogLevel[] | undefined,
): boolean => {
  if (!logLevels || logLevels.length === 0) {
    return true;
  }
  const logLevelsPriority: Record<LogLevel, number> = {
    verbose: 0,
    debug: 1,
    log: 2,
    warn: 3,
    error: 4,
    fatal: 5,
  };
  const targetPriority = logLevelsPriority[targetLevel];
  const lowestPriority = Math.min(
    ...logLevels.map((level) => logLevelsPriority[level]),
  );
  return targetPriority >= lowestPriority;
};
