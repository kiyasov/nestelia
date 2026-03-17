import { afterAll, describe, expect, it } from "bun:test";
import { readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cwd = join(import.meta.dir, "../..");
const genScript = join(cwd, "bin/nestelia-gen.ts");
const tmpOut = join(tmpdir(), `nestelia-gen-test-${Date.now()}.ts`);
const fixtureDir = join(import.meta.dir, "fixtures/imported-schema");
const fixtureTmpOut = join(tmpdir(), `nestelia-gen-fixture-${Date.now()}.ts`);

function runGen(outputPath = tmpOut, { fixtureCwd }: { fixtureCwd?: string } = {}) {
  const extraArgs = fixtureCwd ? ["--tsconfig", join(fixtureCwd, "tsconfig.json")] : [];
  return Bun.spawnSync(["bun", genScript, ...extraArgs, outputPath], {
    cwd: fixtureCwd ?? cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
}

afterAll(() => {
  try { rmSync(tmpOut); } catch {}
  try { rmSync(fixtureTmpOut); } catch {}
});

describe("nestelia-gen", () => {
  it("writes the file on first run and prints 'Written'", () => {
    const result = runGen();
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("Written");
  });

  it("does not rewrite the file on second run (prints 'Up to date')", () => {
    const mtime1 = statSync(tmpOut).mtimeMs;
    // Small delay to ensure mtime would differ if file were rewritten
    Bun.sleepSync(10);
    const result = runGen();
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("Up to date");
    const mtime2 = statSync(tmpOut).mtimeMs;
    expect(mtime2).toBe(mtime1);
  });

  it("rewrites the file when content changes", () => {
    // Corrupt the output file
    writeFileSync(tmpOut, "// outdated content\n");
    const result = runGen();
    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("Written");
  });

  it("does not include a timestamp in the generated file", () => {
    const content = readFileSync(tmpOut, "utf8");
    expect(content).not.toMatch(/\/\/ Generated:/);
  });

  it("generates a valid TypeScript file with appSchema export", () => {
    const content = readFileSync(tmpOut, "utf8");
    expect(content).toContain("export const appSchema");
    expect(content).toContain("export type App =");
  });
});

describe("nestelia-gen: imported schema inlining", () => {
  it("inlines a schema imported from a sibling file", () => {
    const result = runGen(fixtureTmpOut, { fixtureCwd: fixtureDir });
    expect(result.exitCode).toBe(0);
    const content = readFileSync(fixtureTmpOut, "utf8");
    // Should contain the inlined t.Object expression, NOT the variable name
    expect(content).toContain("t.Object(");
    expect(content).toContain("t.String()");
    expect(content).toContain("t.Number()");
    expect(content).not.toContain("createListingSchema");
  });

  it("inlines a schema imported through a barrel re-export", () => {
    const result = runGen(fixtureTmpOut, { fixtureCwd: fixtureDir });
    expect(result.exitCode).toBe(0);
    const content = readFileSync(fixtureTmpOut, "utf8");
    // listingQuerySchema is imported via index.ts (barrel) → dto.ts
    expect(content).not.toContain("listingQuerySchema");
    expect(content).toContain("t.Optional(");
  });

  it("does not generate any import for inlined schemas", () => {
    const content = readFileSync(fixtureTmpOut, "utf8");
    // Only import should be elysia — no imports from ./dto or ./index
    expect(content).not.toContain('from "./');
    expect(content).not.toContain("dto");
  });
});
