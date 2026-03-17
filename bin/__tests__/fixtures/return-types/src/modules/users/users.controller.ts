import { Controller, Get } from "elysia-nest";
import { Param } from "elysia-nest";
import type { User, UserWithPosts } from "./user.types";

@Controller("/users")
export class UsersController {
  @Get()
  findAll(): User[] {
    return [];
  }

  @Get("/:id")
  findOne(): User | null {
    return null;
  }

  @Get("/:id/posts")
  getWithPosts(): Promise<UserWithPosts> {
    return null as never;
  }

  @Get("/health")
  health(): { status: string; timestamp: Date } {
    return null as never;
  }
}
