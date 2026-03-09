import { t } from "elysia";

import { Body, Controller, Delete, Get, Param, Post, Put } from "nestelia";

import { TodoService } from "./todo.service";

@Controller("/todos")
export class TodoController {
  constructor(private readonly todos: TodoService) {}

  @Get("/")
  getAll() {
    return this.todos.findAll();
  }

  @Get("/:id")
  getOne(@Param(t.Object({ id: t.String() })) params: { id: string }) {
    const todo = this.todos.findOne(Number(params.id));
    if (!todo) return new Response("Not found", { status: 404 });
    return todo;
  }

  @Post("/")
  create(@Body(t.Object({ title: t.String() })) body: { title: string }) {
    return this.todos.create(body.title);
  }

  @Put("/:id")
  update(
    @Param(t.Object({ id: t.String() })) params: { id: string },
    @Body(t.Object({ title: t.String() })) body: { title: string },
  ) {
    const todo = this.todos.update(Number(params.id), body.title);
    if (!todo) return new Response("Not found", { status: 404 });
    return todo;
  }

  @Delete("/:id")
  remove(@Param(t.Object({ id: t.String() })) params: { id: string }) {
    const ok = this.todos.remove(Number(params.id));
    if (!ok) return new Response("Not found", { status: 404 });
    return { success: true };
  }
}
