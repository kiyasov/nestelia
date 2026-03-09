import { Injectable } from "nestelia";
import { PassportStrategy } from "../../../packages/passport/src";

@Injectable()
export class BearerStrategy extends PassportStrategy(
  class {
    name = "bearer";
    async authenticate(this: any) {
      const token = (this.req?.headers?.get?.("authorization") ?? "").replace(
        "Bearer ",
        "",
      );
      if (token === "secret-token") {
        this.success({ id: 1, email: "user@example.com" });
      } else {
        this.fail({ message: "Invalid token" });
      }
    }
  },
) {}
