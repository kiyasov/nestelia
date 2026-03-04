import { Injectable } from "@kiyasov/elysia-nest";
import type { CanActivate, ExecutionContext } from "@kiyasov/elysia-nest";

/**
 * Checks that the X-Role header equals "admin".
 * Demonstrates a second guard chained after AuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    return request.headers.get("x-role") === "admin";
  }
}
