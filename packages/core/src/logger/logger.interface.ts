export const LOG_LEVELS = [
  "verbose",
  "debug",
  "log",
  "warn",
  "error",
  "fatal",
] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export interface LoggerService {
  log(message: unknown, ...optionalParams: unknown[]): void;
  error(message: unknown, ...optionalParams: unknown[]): void;
  warn(message: unknown, ...optionalParams: unknown[]): void;
  debug?(message: unknown, ...optionalParams: unknown[]): void;
  verbose?(message: unknown, ...optionalParams: unknown[]): void;
  fatal?(message: unknown, ...optionalParams: unknown[]): void;
  setLogLevels?(levels: LogLevel[]): void;
}

export interface LoggerOptions {
  logLevels?: LogLevel[];
  timestamp?: boolean;
  colors?: boolean;
  context?: string;
}

export const LOGGER_OPTIONS = Symbol("LOGGER_OPTIONS");
