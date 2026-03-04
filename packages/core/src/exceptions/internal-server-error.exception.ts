import { HttpException } from "./http-exception";

/**
 * Exception for 500 Internal Server Error errors
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string | Record<string, unknown> = "Internal Server Error", details?: Record<string, any>) {
    super(message, 500, details);
  }
}
