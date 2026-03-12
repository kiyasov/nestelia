import "reflect-metadata";

import { beforeEach, describe, expect, it } from "bun:test";

import { Test } from "../../../packages/testing/src";
import { UploadResolver } from "./upload.resolver";
import type { UploadedFile } from "../../../packages/apollo/src/upload";

// Helper: create a minimal UploadedFile stub from a File instance.
function makeUpload(file: File): Promise<UploadedFile> {
  return Promise.resolve({
    fieldName: file.name,
    filename: file.name,
    mimetype: file.type,
    size: file.size,
    stream: file.stream(),
    blob: () => Promise.resolve(file),
    arrayBuffer: () => file.arrayBuffer(),
    text: () => file.text(),
  });
}

describe("UploadResolver", () => {
  let resolver: UploadResolver;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UploadResolver],
    }).compile();

    resolver = module.get(UploadResolver);
  });

  // ─── ping ────────────────────────────────────────────────────────────────

  it("ping returns pong", () => {
    expect(resolver.ping()).toBe("pong");
  });

  // ─── uploadFile ──────────────────────────────────────────────────────────

  it("uploadFile returns filename, mimetype and size", async () => {
    const file = new File(["hello world"], "hello.txt", { type: "text/plain" });
    const result = await resolver.uploadFile(makeUpload(file));

    expect(result.filename).toBe("hello.txt");
    expect(result.mimetype).toContain("text/plain");
    expect(result.size).toBe(11);
  });

  it("uploadFile handles binary content", async () => {
    const content = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
    const file = new File([content], "image.png", { type: "image/png" });
    const result = await resolver.uploadFile(makeUpload(file));

    expect(result.filename).toBe("image.png");
    expect(result.mimetype).toBe("image/png");
    expect(result.size).toBe(4);
  });

  // ─── uploadFiles ─────────────────────────────────────────────────────────

  it("uploadFiles returns aggregated results", async () => {
    const files = [
      new File(["aaa"], "a.txt", { type: "text/plain" }),
      new File(["bbbb"], "b.txt", { type: "text/plain" }),
    ];
    const result = await resolver.uploadFiles(files.map(makeUpload));

    expect(result.count).toBe(2);
    expect(result.totalSize).toBe(7);
    expect(result.files[0].filename).toBe("a.txt");
    expect(result.files[1].filename).toBe("b.txt");
  });

  it("uploadFiles returns empty result for empty list", async () => {
    const result = await resolver.uploadFiles([]);

    expect(result.count).toBe(0);
    expect(result.totalSize).toBe(0);
    expect(result.files).toHaveLength(0);
  });

  // ─── stream ──────────────────────────────────────────────────────────────

  it("UploadedFile stream can be read as text", async () => {
    const content = "stream content";
    const file = new File([content], "stream.txt", { type: "text/plain" });
    const upload = await makeUpload(file);

    const reader = upload.stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((n, c) => n + c.length, 0);
    const merged = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    expect(new TextDecoder().decode(merged)).toBe(content);
  });

  it("UploadedFile stream contains correct binary data", async () => {
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG magic bytes
    const file = new File([bytes], "image.png", { type: "image/png" });
    const upload = await makeUpload(file);

    const buffer = await upload.arrayBuffer();
    expect(new Uint8Array(buffer)).toEqual(bytes);
  });
});
