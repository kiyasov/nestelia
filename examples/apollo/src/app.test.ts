import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { BooksResolver } from "./books.resolver";

describe("BooksResolver", () => {
  let resolver: BooksResolver;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BooksResolver],
    }).compile();

    resolver = module.get(BooksResolver);
  });

  it("returns initial books list", () => {
    const books = resolver.books();
    expect(books).toHaveLength(2);
  });

  it("finds a book by id", () => {
    const book = resolver.book(1);
    expect(book?.title).toBe("The Great Gatsby");
  });

  it("returns null for unknown id", () => {
    expect(resolver.book(999)).toBeNull();
  });

  it("adds a book", () => {
    const book = resolver.addBook("Brave New World", "Aldous Huxley");
    expect(book.title).toBe("Brave New World");
    expect(book.author).toBe("Aldous Huxley");
    expect(book.id).toBe(3);
    expect(resolver.books()).toHaveLength(3);
  });

  it("assigns incrementing ids to added books", () => {
    const a = resolver.addBook("Book A", "Author A");
    const b = resolver.addBook("Book B", "Author B");
    expect(b.id).toBe(a.id + 1);
  });

  it("removes a book by id", () => {
    const removed = resolver.removeBook(1);
    expect(removed).toBe(true);
    expect(resolver.books()).toHaveLength(1);
  });

  it("returns false when removing non-existent book", () => {
    expect(resolver.removeBook(999)).toBe(false);
  });
});
