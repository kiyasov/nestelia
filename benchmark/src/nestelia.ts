import "reflect-metadata";
import { t, type Static } from "elysia";
import {
  Body,
  Controller,
  Get,
  Injectable,
  Module,
  Param,
  Post,
  createElysiaApplication,
} from "../../index";

const IdParams = t.Object({ id: t.String() });
const UserBody = t.Object({ name: t.String(), email: t.String() });

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
  index() {
    return "Hello World";
  }

  @Get("/json")
  json() {
    return { message: "Hello World", timestamp: Date.now() };
  }

  @Get("/user/:id")
  user(@Param(IdParams) params: Static<typeof IdParams>) {
    return this.userService.findOne(Number(params.id)) ?? { error: "Not found" };
  }

  @Post("/user")
  createUser(@Body(UserBody) body: Static<typeof UserBody>) {
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
const app = await createElysiaApplication(AppModule, { logger: false });
app.listen(port, () => {
  process.send?.("ready");
});
