import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { TodoService } from "./todo.service";

describe("TodoService", () => {
  let service: TodoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TodoService],
    }).compile();

    service = module.get(TodoService);
  });

  it("starts empty", () => {
    expect(service.findAll()).toEqual([]);
  });

  it("creates a todo", () => {
    const todo = service.create("Buy milk");
    expect(todo.id).toBe(1);
    expect(todo.title).toBe("Buy milk");
    expect(todo.done).toBe(false);
  });

  it("finds by id", () => {
    service.create("Task A");
    const todo = service.findOne(1);
    expect(todo?.title).toBe("Task A");
  });

  it("returns null for unknown id", () => {
    expect(service.findOne(99)).toBeNull();
  });

  it("updates title", () => {
    service.create("Old title");
    const updated = service.update(1, "New title");
    expect(updated?.title).toBe("New title");
  });

  it("toggles done", () => {
    service.create("Toggle me");
    expect(service.toggle(1)?.done).toBe(true);
    expect(service.toggle(1)?.done).toBe(false);
  });

  it("removes a todo", () => {
    service.create("Remove me");
    expect(service.remove(1)).toBe(true);
    expect(service.findAll()).toHaveLength(0);
  });

  it("returns false when removing non-existent id", () => {
    expect(service.remove(99)).toBe(false);
  });

  it("assigns incrementing ids", () => {
    const a = service.create("A");
    const b = service.create("B");
    expect(b.id).toBe(a.id + 1);
  });
});
