import { Injectable, Optional } from "../di/injectable.decorator";
import type { LoggerService, LogLevel } from "./logger.interface";
import { isLogLevelEnabled } from "./utils";

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  day: "2-digit",
  month: "2-digit",
});

@Injectable()
export class ConsoleLogger implements LoggerService {
  private static lastTimestamp?: number;
  private originalContext?: string;

  constructor();
  constructor(context: string);
  constructor(context: string, options: ConsoleLoggerOptions);
  constructor(
    @Optional() protected context?: string,
    @Optional() protected options: ConsoleLoggerOptions = {},
  ) {
    if (context) {
      this.originalContext = context;
    }
  }

  public getTimestamp(): string {
    return dateTimeFormatter.format(Date.now());
  }

  protected formatPid(pid: number): string {
    return `[Elysia] ${pid}  - `;
  }

  protected formatContext(context: string): string {
    return `[${context}] `;
  }

  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string,
  ): string {
    const output =
      typeof message === "object"
        ? `${JSON.stringify(message)}`
        : this.colorize(message as string, logLevel);

    const coloredPidMessage = this.colorize(pidMessage, logLevel);
    const coloredLogLevel = this.colorize(formattedLogLevel, logLevel);
    // Yellow color for context
    const yellow = (str: string): string => `\x1B[33m${str}\x1B[0m`;
    const coloredContextMessage = yellow(contextMessage);

    return `${coloredPidMessage}${this.getTimestamp()} ${coloredLogLevel} ${coloredContextMessage}${output}${timestampDiff}\n`;
  }

  protected printMessages(
    messages: unknown[],
    context = "",
    logLevel: LogLevel = "log",
    writeStreamType?: "stdout" | "stderr",
  ): void {
    const pidMessage = this.formatPid(process.pid);
    const contextMessage = this.formatContext(context);
    const formattedLogLevel = logLevel.toUpperCase().padStart(7, " ");
    const timestampDiff = this.updateAndGetTimestampDiff();

    const formattedMessages = messages.map((message) =>
      this.formatMessage(
        logLevel,
        message,
        pidMessage,
        formattedLogLevel,
        contextMessage,
        timestampDiff,
      ),
    );

    formattedMessages.forEach((formattedMessage) => {
      process[writeStreamType ?? "stdout"].write(formattedMessage);
    });
  }

  protected colorize(message: string, logLevel: LogLevel): string {
    const color = this.getColorByLogLevel(logLevel);
    return color(message);
  }

  protected updateAndGetTimestampDiff(): string {
    const includeTimestamp =
      ConsoleLogger.lastTimestamp && this.options?.timestamp;
    // Yellow color for timestamp diff
    const yellow = (str: string): string => `\x1B[33m${str}\x1B[0m`;
    const result = includeTimestamp
      ? yellow(` +${Date.now() - ConsoleLogger.lastTimestamp!}ms`)
      : "";
    ConsoleLogger.lastTimestamp = Date.now();
    return result;
  }

  protected getColorByLogLevel(level: LogLevel): (message: string) => string {
    switch (level) {
      case "debug":
        return (message: string) => `\x1B[95m${message}\x1B[0m`;
      case "verbose":
        return (message: string) => `\x1B[36m${message}\x1B[0m`;
      case "log":
        return (message: string) => `\x1B[32m${message}\x1B[0m`;
      case "warn":
        return (message: string) => `\x1B[33m${message}\x1B[0m`;
      case "error":
      case "fatal":
        return (message: string) => `\x1B[31m${message}\x1B[0m`;
      default:
        return (message: string) => message;
    }
  }

  public setLogLevels(levels: LogLevel[]): void {
    if (!this.options) {
      this.options = {};
    }
    this.options.logLevels = levels;
  }

  public setContext(context: string): void {
    this.context = context;
  }

  public resetContext(): void {
    this.context = this.originalContext;
  }

  public isLevelEnabled(level: LogLevel): boolean {
    const logLevels = this.options?.logLevels;
    return isLogLevelEnabled(level, logLevels);
  }

  public log(message: unknown, ...optionalParams: unknown[]): void;
  public log(message: unknown, context?: string): void;
  public log(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled("log")) {
      return;
    }
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages(messages, context, "log");
  }

  public error(message: unknown, ...optionalParams: unknown[]): void;
  public error(message: unknown, stack?: string, context?: string): void;
  public error(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled("error")) {
      return;
    }
    const { messages, context, stack } =
      this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
    this.printMessages(messages, context, "error", "stderr");
    this.printStackTrace(stack);
  }

  public warn(message: unknown, ...optionalParams: unknown[]): void;
  public warn(message: unknown, context?: string): void;
  public warn(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled("warn")) {
      return;
    }
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages(messages, context, "warn");
  }

  public debug(message: unknown, ...optionalParams: unknown[]): void;
  public debug(message: unknown, context?: string): void;
  public debug(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled("debug")) {
      return;
    }
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages(messages, context, "debug");
  }

  public verbose(message: unknown, ...optionalParams: unknown[]): void;
  public verbose(message: unknown, context?: string): void;
  public verbose(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled("verbose")) {
      return;
    }
    const { messages, context } = this.getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    this.printMessages(messages, context, "verbose");
  }

  public fatal(message: unknown, ...optionalParams: unknown[]): void;
  public fatal(message: unknown, stack?: string, context?: string): void;
  public fatal(message: unknown, ...optionalParams: unknown[]): void {
    if (!this.isLevelEnabled("fatal")) {
      return;
    }
    const { messages, context, stack } =
      this.getContextAndStackAndMessagesToPrint([message, ...optionalParams]);
    this.printMessages(messages, context, "fatal", "stderr");
    this.printStackTrace(stack);
  }

  protected getContextAndMessagesToPrint(args: unknown[]): {
    messages: unknown[];
    context: string;
  } {
    if (args.length <= 1) {
      return { messages: args, context: this.context || "" };
    }
    const lastArg = args[args.length - 1];
    const isContext = typeof lastArg === "string";
    if (isContext) {
      return {
        messages: args.slice(0, args.length - 1),
        context: lastArg as string,
      };
    }
    return { messages: args, context: this.context || "" };
  }

  protected getContextAndStackAndMessagesToPrint(args: unknown[]): {
    messages: unknown[];
    context: string;
    stack?: string;
  } {
    const { messages, context } = this.getContextAndMessagesToPrint(args);
    if (messages.length <= 1) {
      const singleArg = messages[0];
      if (singleArg instanceof Error) {
        return {
          messages: [singleArg.message],
          context,
          stack: singleArg.stack,
        };
      }
      return { messages, context };
    }
    const lastArg = messages[messages.length - 1];
    if (typeof lastArg === "string") {
      return {
        messages: messages.slice(0, messages.length - 1),
        context,
        stack: lastArg,
      };
    }
    if (lastArg instanceof Error) {
      return {
        messages: messages.slice(0, messages.length - 1),
        context,
        stack: lastArg.stack,
      };
    }
    return { messages, context };
  }

  protected printStackTrace(stack: string | undefined): void {
    if (!stack) {
      return;
    }
    console.error(stack);
  }
}

export interface ConsoleLoggerOptions {
  logLevels?: LogLevel[];
  timestamp?: boolean;
  colors?: boolean;
}
