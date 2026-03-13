import { t, type Static } from "elysia";

import { Body, Controller, Delete, Get, Param, Post, Put } from "nestelia";

import { TodoService } from "./todo.service";

const IdParams = t.Object({ id: t.String() });
const TodoBody = t.Object({ title: t.String() });

@Controller("/todos")
export class TodoController {
  constructor(private readonly todos: TodoService) {}

  @Get("/")
  getAll() {
    return this.todos.findAll();
  }

  @Get("/:id")
  getOne(@Param(IdParams) params: Static<typeof IdParams>) {
    const todo = this.todos.findOne(Number(params.id));
    if (!todo) return new Response("Not found", { status: 404 });
    return todo;
  }

  @Post("/")
  create(@Body(TodoBody) body: Static<typeof TodoBody>) {
    return this.todos.create(body.title);
  }

  @Put("/:id")
  update(
    @Param(IdParams) params: Static<typeof IdParams>,
    @Body(TodoBody) body: Static<typeof TodoBody>,
  ) {
    const todo = this.todos.update(Number(params.id), body.title);
    if (!todo) return new Response("Not found", { status: 404 });
    return todo;
  }

  @Delete("/:id")
  remove(@Param(IdParams) params: Static<typeof IdParams>) {
    const ok = this.todos.remove(Number(params.id));
    if (!ok) return new Response("Not found", { status: 404 });
    return { success: true };
  }
}
