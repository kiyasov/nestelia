import type { User, UserWithPosts } from "./user.types";

export class UsersService {
  findAll(): User[] {
    return [];
  }

  findOne(id: string): User | null {
    return null;
  }

  getWithPosts(id: string): Promise<UserWithPosts> {
    return null as never;
  }
}
