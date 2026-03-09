import { Injectable } from "nestelia";
import type { CanActivate, ExecutionContext } from "nestelia";

/**
 * Checks that the Authorization header is present.
 * Returns 403 Forbidden if missing.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    return request.headers.get("authorization") !== null;
  }
}
