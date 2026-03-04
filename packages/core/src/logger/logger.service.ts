import { Injectable, Optional } from "../di/injectable.decorator";
import { isObject } from "../utils/shared.utils";
import { ConsoleLogger } from "./console-logger.service";
import type { LoggerService, LogLevel } from "./logger.interface";
import { isLogLevelEnabled } from "./utils";

interface LogBufferRecord {
  methodRef: (...args: unknown[]) => unknown;
  arguments: unknown[];
}

const DEFAULT_LOGGER = new ConsoleLogger("", { timestamp: true });

@Injectable()
export class Logger implements LoggerService {
  protected static logBuffer = new Array<LogBufferRecord>();
  protected static staticInstanceRef?: LoggerService = DEFAULT_LOGGER;
  protected static logLevels?: LogLevel[];
  private static isBufferAttached: boolean;

  protected localInstanceRef?: LoggerService;

  constructor();
  constructor(context: string);
  constructor(context: string, options: { timestamp?: boolean });
  constructor(
    @Optional() protected context?: string,
    @Optional() protected options: { timestamp?: boolean } = {},
  ) {}

  public get localInstance(): LoggerService {
    if (Logger.staticInstanceRef === DEFAULT_LOGGER) {
      return this.registerLocalInstanceRef();
    } else if (Logger.staticInstanceRef instanceof Logger) {
      const prototype = Object.getPrototypeOf(Logger.staticInstanceRef);
      if (prototype.constructor === Logger) {
        return this.registerLocalInstanceRef();
      }
    }
    return Logger.staticInstanceRef!;
  }

  private static runOrBuffer(fn: () => void): void {
    if (Logger.isBufferAttached) {
      Logger.logBuffer.push({
        methodRef: fn,
        arguments: [],
      });
      return;
    }
    fn();
  }

  public error(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      const params = this.context
        ? (optionalParams.length ? optionalParams : [undefined]).concat(
            this.context,
          )
        : optionalParams;
      this.localInstance?.error(message, ...params);
    });
  }

  public log(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      const params = this.context
        ? optionalParams.concat(this.context)
        : optionalParams;
      this.localInstance?.log(message, ...params);
    });
  }

  public warn(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      const params = this.context
        ? optionalParams.concat(this.context)
        : optionalParams;
      this.localInstance?.warn(message, ...params);
    });
  }

  public debug(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      const params = this.context
        ? optionalParams.concat(this.context)
        : optionalParams;
      this.localInstance?.debug?.(message, ...params);
    });
  }

  public verbose(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      const params = this.context
        ? optionalParams.concat(this.context)
        : optionalParams;
      this.localInstance?.verbose?.(message, ...params);
    });
  }

  public fatal(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      const params = this.context
        ? optionalParams.concat(this.context)
        : optionalParams;
      this.localInstance?.fatal?.(message, ...params);
    });
  }

  public static error(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      Logger.staticInstanceRef?.error(message, ...optionalParams);
    });
  }

  public static log(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      Logger.staticInstanceRef?.log(message, ...optionalParams);
    });
  }

  public static warn(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      Logger.staticInstanceRef?.warn(message, ...optionalParams);
    });
  }

  public static debug(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      Logger.staticInstanceRef?.debug?.(message, ...optionalParams);
    });
  }

  public static verbose(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      Logger.staticInstanceRef?.verbose?.(message, ...optionalParams);
    });
  }

  public static fatal(message: unknown, ...optionalParams: unknown[]) {
    Logger.runOrBuffer(() => {
      Logger.staticInstanceRef?.fatal?.(message, ...optionalParams);
    });
  }

  public static flush() {
    this.isBufferAttached = false;
    this.logBuffer.forEach((item) =>
      item.methodRef(...(item.arguments as [string])),
    );
    this.logBuffer = [];
  }

  public static attachBuffer() {
    this.isBufferAttached = true;
  }

  public static detachBuffer() {
    this.isBufferAttached = false;
  }

  public static getTimestamp() {
    return ConsoleLogger.prototype.getTimestamp();
  }

  public static overrideLogger(logger: LoggerService | LogLevel[] | boolean) {
    if (Array.isArray(logger)) {
      Logger.logLevels = logger;
      return this.staticInstanceRef?.setLogLevels?.(logger);
    }
    if (isObject(logger)) {
      if (logger instanceof Logger && logger.constructor !== Logger) {
        const errorMessage = `Using the "extends Logger" instruction is not allowed. Please, use "extends ConsoleLogger" instead.`;
        this.staticInstanceRef?.error(errorMessage);
        throw new Error(errorMessage);
      }
      this.staticInstanceRef = logger as LoggerService;
    } else {
      this.staticInstanceRef = undefined;
    }
  }

  public static isLevelEnabled(level: LogLevel): boolean {
    const logLevels = Logger.logLevels;
    return isLogLevelEnabled(level, logLevels);
  }

  private registerLocalInstanceRef() {
    if (this.localInstanceRef) {
      return this.localInstanceRef;
    }
    this.localInstanceRef = new ConsoleLogger(this.context!, {
      timestamp: this.options?.timestamp ?? true,
      logLevels: Logger.logLevels,
    });
    return this.localInstanceRef;
  }
}
