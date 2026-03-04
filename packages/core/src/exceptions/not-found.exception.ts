import { HttpException } from "./http-exception";

/**
 * Exception for 404 Not Found errors
 */
export class NotFoundException extends HttpException {
  /**
   * Create a new NotFoundException
   *
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string | Record<string, unknown> = "Not Found", details?: Record<string, any>) {
    super(message, 404, details);
  }
}
