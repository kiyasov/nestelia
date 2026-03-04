import "reflect-metadata";

import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Elysia } from "elysia";

import { createElysiaApplication } from "../../../index";
import { AppModule } from "./app.module";

let server: Elysia;

beforeAll(async () => {
  const app = await createElysiaApplication(AppModule);
  server = app.getHttpServer();
});

afterAll(() => {});

function post(path: string, body: FormData): Promise<Response> {
  return server.handle(
    new Request(`http://localhost${path}`, { method: "POST", body }),
  );
}

// ─── Single file ──────────────────────────────────────────────────────────────

describe("POST /upload/single", () => {
  it("returns file metadata for uploaded file", async () => {
    const form = new FormData();
    form.append("file", new File(["hello world"], "hello.txt", { type: "text/plain" }));

    const res = await post("/upload/single", form);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.name).toBe("hello.txt");
    expect(body.size).toBe(11);
    expect(body.type).toContain("text/plain");
  });
});

// ─── Multiple files ───────────────────────────────────────────────────────────

describe("POST /upload/multiple", () => {
  it("returns metadata for each uploaded file", async () => {
    const form = new FormData();
    form.append("files", new File(["aaa"], "a.txt", { type: "text/plain" }));
    form.append("files", new File(["bbbb"], "b.txt", { type: "text/plain" }));

    const res = await post("/upload/multiple", form);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe("a.txt");
    expect(body[0].size).toBe(3);
    expect(body[1].name).toBe("b.txt");
    expect(body[1].size).toBe(4);
  });
});

// ─── Form + file ──────────────────────────────────────────────────────────────

describe("POST /upload/form", () => {
  it("returns form text field and file metadata together", async () => {
    const form = new FormData();
    form.append("name", "John");
    form.append("avatar", new File(["<png>"], "avatar.png", { type: "image/png" }));

    const res = await post("/upload/form", form);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.name).toBe("John");
    expect(body.avatar.name).toBe("avatar.png");
    expect(body.avatar.type).toBe("image/png");
  });
});

// ─── Any file ─────────────────────────────────────────────────────────────────

describe("POST /upload/any", () => {
  it("picks up the first file regardless of field name", async () => {
    const form = new FormData();
    form.append("document", new File(["pdf content"], "report.pdf", { type: "application/pdf" }));

    const res = await post("/upload/any", form);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.name).toBe("report.pdf");
    expect(body.type).toBe("application/pdf");
  });

  it("returns null when no file is sent", async () => {
    const form = new FormData();
    form.append("name", "no-file");

    const res = await post("/upload/any", form);
    expect(res.status).toBe(200);

    // Elysia serializes null as an empty body
    const text = await res.text();
    expect(!text || text === "null").toBe(true);
  });
});
