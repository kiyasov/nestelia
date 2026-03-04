import { HttpException } from "./http-exception";

/**
 * Exception for 400 Bad Request errors
 */
export class BadRequestException extends HttpException {
  /**
   * Create a new BadRequestException
   *
   * @param message Error message
   * @param details Additional error details
   */
  constructor(message: string | Record<string, unknown> = "Bad Request", details?: Record<string, any>) {
    super(message, 400, details);
  }
}
