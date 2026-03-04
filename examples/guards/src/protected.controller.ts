import { Controller, Get, UseGuards } from "@kiyasov/elysia-nest";

import { AuthGuard } from "./auth.guard";
import { RolesGuard } from "./roles.guard";

/** Public routes — no guards applied. */
@Controller("/api")
export class PublicController {
  @Get("/public")
  public() {
    return { message: "Public endpoint — no auth required" };
  }
}

/**
 * Protected routes — AuthGuard runs on every method (class-level).
 * /admin additionally requires RolesGuard (method-level).
 */
@Controller("/api")
@UseGuards(AuthGuard)
export class ProtectedController {
  /** Requires Authorization header. */
  @Get("/profile")
  profile() {
    return { message: "Authenticated successfully" };
  }

  /** Requires Authorization header AND x-role: admin. */
  @Get("/admin")
  @UseGuards(RolesGuard)
  admin() {
    return { message: "Admin area" };
  }
}
