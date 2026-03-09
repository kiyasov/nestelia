import { Logger } from "nestelia";

/**
 * Logger instance for the Apollo package.
 * Used for logging GraphQL schema building and runtime information.
 */
export const packageLogger = new Logger("apollo");
