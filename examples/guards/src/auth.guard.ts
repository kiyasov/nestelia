import { Injectable } from "@kiyasov/elysia-nest";
import type { CanActivate, ExecutionContext } from "@kiyasov/elysia-nest";

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
