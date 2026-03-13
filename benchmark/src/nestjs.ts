import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Post,
} from "@nestjs/common";

@Injectable()
class UserService {
  private users = [
    { id: 1, name: "Alice", email: "alice@test.com" },
    { id: 2, name: "Bob", email: "bob@test.com" },
    { id: 3, name: "Charlie", email: "charlie@test.com" },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find((u) => u.id === id) ?? null;
  }

  create(name: string, email: string) {
    return { id: this.users.length + 1, name, email };
  }
}

@Controller()
class AppController {
  constructor(private readonly userService: UserService) {}

  @Get("/")
  index(): string {
    return "Hello World";
  }

  @Get("/json")
  json() {
    return { message: "Hello World", timestamp: Date.now() };
  }

  @Get("/user/:id")
  user(@Param("id") id: string) {
    return this.userService.findOne(Number(id)) ?? { error: "Not found" };
  }

  @Post("/user")
  createUser(@Body() body: { name: string; email: string }) {
    return this.userService.create(body.name, body.email);
  }

  @Get("/users")
  users() {
    return this.userService.findAll();
  }
}

@Module({ controllers: [AppController], providers: [UserService] })
class AppModule {}

const port = Number(process.env.PORT) || 3000;
const app = await NestFactory.create(AppModule, { logger: false });
await app.listen(port);
if (process.send) process.send("ready");
