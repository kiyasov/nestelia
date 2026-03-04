import type { ValueProvider } from "../di/provider.interface";
import { LOGGER_OPTIONS, type LoggerOptions } from "./logger.interface";

/**
 * Default logger options provider
 */
export const LoggerOptionsProvider: ValueProvider = {
  provide: LOGGER_OPTIONS,
  useValue: {
    timestamp: true,
    colors: true,
  },
};

/**
 * Factory to create logger options provider with custom options
 */
export function createLoggerOptionsProvider(
  options: LoggerOptions,
): ValueProvider {
  return {
    provide: LOGGER_OPTIONS,
    useValue: options,
  };
}
