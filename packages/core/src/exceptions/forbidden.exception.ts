import { HttpException } from "./http-exception";

/**
 * Exception for 403 Forbidden errors
 */
export class ForbiddenException extends HttpException {
  /**
   * Create a new ForbiddenException
   *
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string | Record<string, unknown> = "Forbidden", details?: Record<string, any>) {
    super(message, 403, details);
  }
}
