import { Injectable } from "@kiyasov/elysia-nest";

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

@Injectable()
export class TodoService {
  private todos: Todo[] = [];
  private nextId = 1;

  findAll() {
    return this.todos;
  }

  findOne(id: number) {
    return this.todos.find((t) => t.id === id) ?? null;
  }

  create(title: string) {
    const todo: Todo = { id: this.nextId++, title, done: false };
    this.todos.push(todo);
    return todo;
  }

  update(id: number, title: string) {
    const todo = this.findOne(id);
    if (!todo) return null;
    todo.title = title;
    return todo;
  }

  toggle(id: number) {
    const todo = this.findOne(id);
    if (!todo) return null;
    todo.done = !todo.done;
    return todo;
  }

  remove(id: number) {
    const idx = this.todos.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.todos.splice(idx, 1);
    return true;
  }
}
