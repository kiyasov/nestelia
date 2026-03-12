import "reflect-metadata";

import { describe, expect, it } from "bun:test";

import { processMultipartRequest } from "../src/upload";

function makeBody(
  query: string,
  files: Record<string, File>,
  map: Record<string, string[]>,
): FormData {
  const form = new FormData();
  form.set(
    "operations",
    JSON.stringify({ query, variables: Object.fromEntries(Object.keys(map).map((k) => [map[k][0].split(".")[1], null])) }),
  );
  form.set("map", JSON.stringify(map));
  for (const [key, file] of Object.entries(files)) {
    form.set(key, file);
  }
  return form;
}

// ─── processMultipartRequest ─────────────────────────────────────────────────

describe("processMultipartRequest", () => {
  it("injects a single file into operations", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    const body = makeBody("mutation($file:Upload!){upload(file:$file)}", { "0": file }, { "0": ["variables.file"] });

    const result = await processMultipartRequest(body);
    expect((result.variables as Record<string, unknown>).file).toBeDefined();
  });

  it("throws when operations field is missing", async () => {
    const form = new FormData();
    await expect(processMultipartRequest(form)).rejects.toThrow(
      "Missing 'operations' field",
    );
  });

  // ─── maxFiles ──────────────────────────────────────────────────────────────

  it("throws when number of files exceeds maxFiles option", async () => {
    const form = new FormData();
    form.set("operations", JSON.stringify({ query: "mutation", variables: {} }));
    const map: Record<string, string[]> = {};
    for (let i = 0; i < 3; i++) {
      map[String(i)] = [`variables.files.${i}`];
      form.set(String(i), new File(["x"], `f${i}.txt`));
    }
    form.set("map", JSON.stringify(map));

    await expect(processMultipartRequest(form, { maxFiles: 2 })).rejects.toThrow(
      "Too many files: 3. Maximum allowed: 2",
    );
  });

  it("accepts exactly maxFiles files", async () => {
    const form = new FormData();
    form.set("operations", JSON.stringify({ query: "mutation", variables: {} }));
    const map: Record<string, string[]> = {};
    for (let i = 0; i < 2; i++) {
      map[String(i)] = [`variables.files.${i}`];
      form.set(String(i), new File(["x"], `f${i}.txt`));
    }
    form.set("map", JSON.stringify(map));

    await expect(processMultipartRequest(form, { maxFiles: 2 })).resolves.toBeDefined();
  });

  it("uses default limit of 10 when maxFiles is not set", async () => {
    const form = new FormData();
    form.set("operations", JSON.stringify({ query: "mutation", variables: {} }));
    const map: Record<string, string[]> = {};
    for (let i = 0; i < 11; i++) {
      map[String(i)] = [`variables.files.${i}`];
      form.set(String(i), new File(["x"], `f${i}.txt`));
    }
    form.set("map", JSON.stringify(map));

    await expect(processMultipartRequest(form)).rejects.toThrow(
      "Too many files: 11. Maximum allowed: 10",
    );
  });

  // ─── maxFileSize ───────────────────────────────────────────────────────────

  it("throws when a file exceeds maxFileSize", async () => {
    const file = new File(["hello world"], "big.txt", { type: "text/plain" }); // 11 bytes
    const body = makeBody("mutation($file:Upload!){upload(file:$file)}", { "0": file }, { "0": ["variables.file"] });

    await expect(processMultipartRequest(body, { maxFileSize: 5 })).rejects.toThrow(
      'File "big.txt" exceeds the size limit of 5 bytes',
    );
  });

  it("accepts a file exactly at maxFileSize", async () => {
    const file = new File(["hello"], "ok.txt", { type: "text/plain" }); // 5 bytes
    const body = makeBody("mutation($file:Upload!){upload(file:$file)}", { "0": file }, { "0": ["variables.file"] });

    await expect(processMultipartRequest(body, { maxFileSize: 5 })).resolves.toBeDefined();
  });

  it("accepts files when maxFileSize is not set", async () => {
    const file = new File([new Uint8Array(1_000_000)], "large.bin");
    const body = makeBody("mutation($file:Upload!){upload(file:$file)}", { "0": file }, { "0": ["variables.file"] });

    await expect(processMultipartRequest(body)).resolves.toBeDefined();
  });
});
