import { Controller, Get, UseGuards } from "nestelia";
import { AuthGuard } from "../../../packages/passport/src";

@Controller("/auth")
export class AuthController {
  @Get("/profile")
  @UseGuards(AuthGuard("bearer"))
  profile() {
    return { message: "Authenticated successfully" };
  }

  @Get("/public")
  public() {
    return { message: "Public route — no auth needed" };
  }
}
