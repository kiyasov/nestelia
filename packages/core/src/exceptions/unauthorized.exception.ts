import { HttpException } from "./http-exception";

/**
 * Exception for 401 Unauthorized errors
 */
export class UnauthorizedException extends HttpException {
  /**
   * Create a new UnauthorizedException
   *
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string | Record<string, unknown> = "Unauthorized", details?: Record<string, any>) {
    super(message, 401, details);
  }
}
