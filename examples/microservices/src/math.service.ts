import { Injectable } from "@kiyasov/elysia-nest";
import {
  EventPattern,
  MessagePattern,
  Payload,
} from "../../../packages/microservices";

@Injectable()
export class MathService {
  @MessagePattern("math.add")
  add(@Payload() data: { a: number; b: number }) {
    return { result: data.a + data.b };
  }

  @MessagePattern("math.multiply")
  multiply(@Payload() data: { a: number; b: number }) {
    return { result: data.a * data.b };
  }

  @EventPattern("user.created")
  onUserCreated(@Payload() data: { id: number; email: string }) {
    console.log(`[event] New user: ${data.email} (id=${data.id})`);
  }
}
