#!/usr/bin/env bun
/**
 * nestelia-gen — static schema generator (ts-morph edition).
 *
 * Reads @Controller / @Get / @Post / ... decorators and generates a fully-typed
 * Elysia schema file — including return types from TypeScript annotations.
 *
 * The generated file is fully self-contained: return types are expanded
 * structurally via the TypeScript type checker so no project-local imports
 * are needed (only `import { Elysia, t } from "elysia"`).
 *
 * Usage:
 *   bunx nestelia-gen [--tsconfig <path>] [output-file]
 *
 * Examples:
 *   bunx nestelia-gen                               # → src/app.schema.ts
 *   bunx nestelia-gen src/schema.ts
 *   bunx nestelia-gen --tsconfig tsconfig.app.json src/schema.ts
 */

import {
  Project,
  Node,
  SyntaxKind,
  ts,
  type Decorator,
  type SourceFile,
} from "ts-morph";
import { resolve, relative, dirname } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";

// ─── CLI ────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let tsConfigPath = "tsconfig.json";
let outputArg: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tsconfig" && args[i + 1]) {
    tsConfigPath = args[++i]!;
  } else {
    outputArg = args[i];
  }
}

const cwd = process.cwd();
const outputFile = resolve(cwd, outputArg ?? "src/app.schema.ts");
const outputDir = dirname(outputFile);

// ─── ts-morph project ────────────────────────────────────────────────────────

const project = new Project({
  tsConfigFilePath: resolve(cwd, tsConfigPath),
});

const compilerChecker = project.getTypeChecker().compilerObject;

// ─── Constants ───────────────────────────────────────────────────────────────

const HTTP_METHODS: Record<string, string> = {
  Get: "get",
  Post: "post",
  Put: "put",
  Patch: "patch",
  Delete: "delete",
};

// ─── Data structures ─────────────────────────────────────────────────────────

interface Route {
  method: string;
  path: string;
  returnType: string; // Fully-expanded TypeScript type text
  body?: string; // TypeBox expression text, e.g. "t.Object({ title: t.String() })"
  params?: string;
  query?: string;
}

const routes: Route[] = [];

// ─── Source file walker ──────────────────────────────────────────────────────

for (const sf of project.getSourceFiles()) {
  if (sf.isDeclarationFile()) continue;
  if (sf.getFilePath().includes("node_modules")) continue;

  for (const classDecl of sf.getClasses()) {
    const ctrlDec = classDecl.getDecorator("Controller");
    if (!ctrlDec) continue;

    const prefix = stringLiteralOrEmpty(ctrlDec, 0);

    for (const method of classDecl.getMethods()) {
      let httpMethod: string | undefined;
      let routePath = "/";

      for (const dec of method.getDecorators()) {
        const m = HTTP_METHODS[dec.getName()];
        if (m) {
          httpMethod = m;
          routePath = stringLiteralOrEmpty(dec, 0) || "/";
          break;
        }
      }

      if (!httpMethod) continue;

      // ── Return type (expanded via type checker) ─────────────────────────────
      const returnType = expandReturnType(method);

      // ── Parameter decorators: @Body, @Param, @Query ────────────────────────
      let body: string | undefined;
      let params: string | undefined;
      let query: string | undefined;

      for (const param of method.getParameters()) {
        for (const dec of param.getDecorators()) {
          const arg = dec.getArguments()[0];
          if (!arg) continue;
          const expr = resolveExpression(arg, sf);
          if (dec.getName() === "Body") body = expr;
          else if (dec.getName() === "Param") params = expr;
          else if (dec.getName() === "Query") query = expr;
        }
      }

      routes.push({
        method: httpMethod,
        path: joinPaths(prefix, routePath),
        returnType,
        body,
        params,
        query,
      });
    }
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function stringLiteralOrEmpty(dec: Decorator, index: number): string {
  const arg = dec.getArguments()[index];
  if (arg && Node.isStringLiteral(arg)) return arg.getLiteralValue();
  return "";
}

function joinPaths(...parts: string[]): string {
  const joined = ("/" + parts.join("/")).replace(/\/+/g, "/");
  // strip trailing slash unless it's the root "/"
  return joined.length > 1 ? joined.replace(/\/$/, "") : joined;
}

/**
 * Given a decorator argument node, return the corresponding TypeBox expression
 * text. If the node is an identifier (e.g. `TodoBody`), look up its definition
 * in the same file or in the file it was imported from, and return the
 * initializer expression text instead of the variable name.
 */
function resolveExpression(node: Node, sf: SourceFile): string {
  if (!Node.isIdentifier(node)) return node.getText();

  const name = node.getText();
  const resolved = resolveIdentifier(name, sf, new Set());
  if (!resolved) {
    console.warn(`Warning: could not inline schema variable "${name}" — using identifier as-is.`);
  }
  return resolved ?? name;
}

/**
 * Inline all identifier references inside an expression by recursively
 * resolving them to their initializer text. Skips property-access names
 * (e.g. the `foo` in `obj.foo`) and property-assignment names.
 */
function inlineExpression(
  expr: Node,
  sf: SourceFile,
  seen: Set<string>,
): string {
  let text = expr.getText();

  const identifiers = expr.getDescendantsOfKind(SyntaxKind.Identifier);

  // Process from last to first so replacement offsets stay valid
  const exprStart = expr.getStart();
  const replacements: { start: number; end: number; replacement: string }[] = [];

  for (const id of identifiers) {
    const parent = id.getParent();
    if (!parent) continue;

    // Skip property access names: `obj.prop` — skip `prop`
    if (
      Node.isPropertyAccessExpression(parent) &&
      parent.getNameNode() === id
    ) continue;

    // Skip property assignment names: `{ key: value }` — skip `key`
    if (
      Node.isPropertyAssignment(parent) &&
      parent.getNameNode() === id
    ) continue;

    // Skip shorthand property assignment names: `{ key }` — skip `key`
    if (Node.isShorthandPropertyAssignment(parent)) continue;

    const idName = id.getText();
    // Skip `t` (the TypeBox namespace) and other single-char common names
    if (idName === "t") continue;

    const resolved = resolveIdentifier(idName, sf, new Set(seen));
    if (resolved && resolved !== idName) {
      const start = id.getStart() - exprStart;
      const end = id.getEnd() - exprStart;
      replacements.push({ start, end, replacement: resolved });
    }
  }

  // Apply replacements from last to first
  replacements.sort((a, b) => b.start - a.start);
  for (const { start, end, replacement } of replacements) {
    text = text.slice(0, start) + replacement + text.slice(end);
  }

  return text;
}

/**
 * Recursively resolve an identifier to its TypeBox initializer text.
 * Follows: local variables → named imports → re-exports → star re-exports.
 * `seen` prevents infinite loops on circular re-exports.
 */
function resolveIdentifier(
  name: string,
  sf: SourceFile,
  seen: Set<string>,
): string | undefined {
  const key = `${sf.getFilePath()}::${name}`;
  if (seen.has(key)) return undefined;
  seen.add(key);

  // 1. Local variable declaration: `const schema = t.Object({...})`
  const local = sf.getVariableDeclaration(name);
  if (local) {
    const init = local.getInitializer();
    if (init) return inlineExpression(init, sf, seen);
  }

  // 2. Named imports: `import { schema } from "./dto"`
  for (const imp of sf.getImportDeclarations()) {
    for (const named of imp.getNamedImports()) {
      if (named.getName() !== name) continue;
      const importedSf = imp.getModuleSpecifierSourceFile();
      if (!importedSf) return undefined;
      const originalName = named.getAliasNode()?.getText() ?? name;
      return resolveIdentifier(originalName, importedSf, seen);
    }
  }

  // 3. Named re-exports: `export { schema } from "./schemas"`
  for (const exp of sf.getExportDeclarations()) {
    for (const named of exp.getNamedExports()) {
      if (named.getName() !== name) continue;
      const reExportSf = exp.getModuleSpecifierSourceFile();
      if (reExportSf) {
        const originalName = named.getAliasNode()?.getText() ?? name;
        return resolveIdentifier(originalName, reExportSf, seen);
      }
    }
  }

  // 4. Star re-exports: `export * from "./dto"`
  for (const exp of sf.getExportDeclarations()) {
    if (exp.getNamedExports().length > 0) continue; // skip named re-exports (handled above)
    if (!exp.getModuleSpecifierValue()) continue;
    const reExportSf = exp.getModuleSpecifierSourceFile();
    if (reExportSf) {
      const result = resolveIdentifier(name, reExportSf, seen);
      if (result) return result;
    }
  }

  return undefined;
}

// ─── Return type expansion ──────────────────────────────────────────────────

/**
 * Expand the method's return type into a fully self-contained type string
 * using the TypeScript type checker, so no project-local imports are needed.
 */
function expandReturnType(method: Node): string {
  const sig = compilerChecker.getSignatureFromDeclaration(
    method.compilerNode as ts.SignatureDeclaration,
  );
  if (!sig) return "unknown";
  const type = compilerChecker.getReturnTypeOfSignature(sig);
  return printType(type, method.compilerNode, 0, new Set());
}

/**
 * Recursively print a TypeScript type as a self-contained string.
 * - Primitives, literals, unions, intersections → printed directly
 * - Well-known globals (Promise, Date, Map, Set, etc.) → kept by name, type args expanded
 * - Project-local types (interfaces, type aliases) → expanded structurally
 */
function printType(
  type: ts.Type,
  anchor: ts.Node,
  depth: number,
  seen: Set<number>,
): string {
  if (depth > 10) return "unknown";
  const f = type.getFlags();

  // ── Primitives ──────────────────────────────────────────────────────────────
  if (f & ts.TypeFlags.String) return "string";
  if (f & ts.TypeFlags.Number) return "number";
  if (f & ts.TypeFlags.Null) return "null";
  if (f & ts.TypeFlags.Undefined) return "undefined";
  if (f & ts.TypeFlags.Void) return "void";
  if (f & ts.TypeFlags.Never) return "never";
  if (f & ts.TypeFlags.Any) return "any";
  if (f & ts.TypeFlags.Unknown) return "unknown";
  if (f & ts.TypeFlags.BigInt) return "bigint";

  // ── Literals ────────────────────────────────────────────────────────────────
  if (f & ts.TypeFlags.StringLiteral)
    return JSON.stringify((type as ts.StringLiteralType).value);
  if (f & ts.TypeFlags.NumberLiteral)
    return String((type as ts.NumberLiteralType).value);
  if (f & ts.TypeFlags.BigIntLiteral) {
    const v = (type as ts.BigIntLiteralType).value;
    return `${v.negative ? "-" : ""}${v.base10Value}n`;
  }
  if (f & ts.TypeFlags.BooleanLiteral)
    return (type as any).intrinsicName === "true" ? "true" : "false";

  // ── Union ───────────────────────────────────────────────────────────────────
  if (type.isUnion()) {
    const members = (type as ts.UnionType).types;
    // Detect `boolean` (union of `true | false`)
    if (
      members.length === 2 &&
      members.every((t) => t.getFlags() & ts.TypeFlags.BooleanLiteral)
    )
      return "boolean";
    return members
      .map((t) => printType(t, anchor, depth + 1, seen))
      .join(" | ");
  }

  // ── Intersection ────────────────────────────────────────────────────────────
  if (type.isIntersection()) {
    return (type as ts.IntersectionType).types
      .map((t) => printType(t, anchor, depth + 1, seen))
      .join(" & ");
  }

  // ── Array / Tuple ───────────────────────────────────────────────────────────
  if (compilerChecker.isArrayType(type)) {
    const typeArgs = compilerChecker.getTypeArguments(
      type as ts.TypeReference,
    );
    if (typeArgs.length === 1) {
      const inner = printType(typeArgs[0], anchor, depth + 1, seen);
      return inner.includes(" | ") || inner.includes(" & ")
        ? `Array<${inner}>`
        : `${inner}[]`;
    }
  }

  if (compilerChecker.isTupleType(type)) {
    const typeArgs = compilerChecker.getTypeArguments(
      type as ts.TypeReference,
    );
    return `[${typeArgs.map((t) => printType(t, anchor, depth + 1, seen)).join(", ")}]`;
  }

  // ── Well-known external types (Promise, Date, Map, Set, etc.) ─────────────
  const symbol = type.getSymbol() ?? type.aliasSymbol;
  if (symbol) {
    const decls = symbol.getDeclarations();
    const isExternal = decls?.some((d) => {
      const fn = d.getSourceFile().fileName;
      return fn.includes("/node_modules/") || fn.includes("/typescript/lib/");
    });

    if (isExternal) {
      const name = symbol.getName();
      // Skip internal/anonymous symbol names (e.g. "__type") — expand structurally instead
      if (!name.startsWith("__")) {
        const typeArgs = (type as ts.TypeReference).typeArguments;
        if (typeArgs && typeArgs.length > 0) {
          const args = typeArgs.map((t) =>
            printType(t, anchor, depth + 1, seen),
          );
          return `${name}<${args.join(", ")}>`;
        }
        return name;
      }
    }
  }

  // ── Object type → expand structurally ─────────────────────────────────────
  if (f & ts.TypeFlags.Object) {
    const id = (type as any).id as number | undefined;
    if (id !== undefined && seen.has(id)) return "unknown";
    const newSeen = new Set(seen);
    if (id !== undefined) newSeen.add(id);

    // Check for call signatures (function types)
    const callSigs = type.getCallSignatures();
    if (callSigs.length > 0) {
      const props = compilerChecker.getPropertiesOfType(type);
      if (props.length === 0) {
        const sig = callSigs[0];
        const params = sig.getParameters().map((p) => {
          const pType = compilerChecker.getTypeOfSymbolAtLocation(p, anchor);
          return `${p.getName()}: ${printType(pType, anchor, depth + 1, newSeen)}`;
        });
        const ret = printType(
          compilerChecker.getReturnTypeOfSignature(sig),
          anchor,
          depth + 1,
          newSeen,
        );
        return `(${params.join(", ")}) => ${ret}`;
      }
    }

    // Regular object — expand properties
    const props = compilerChecker.getPropertiesOfType(type);
    const indexInfos = compilerChecker.getIndexInfosOfType(type);

    if (props.length === 0 && indexInfos.length === 0) return "{}";

    const parts: string[] = [];

    for (const info of indexInfos) {
      const keyType = printType(info.keyType, anchor, depth + 1, newSeen);
      const valType = printType(info.type, anchor, depth + 1, newSeen);
      parts.push(`[key: ${keyType}]: ${valType}`);
    }

    for (const prop of props) {
      const propType = compilerChecker.getTypeOfSymbolAtLocation(prop, anchor);
      const opt = prop.flags & ts.SymbolFlags.Optional ? "?" : "";
      const expanded = printType(propType, anchor, depth + 1, newSeen);
      parts.push(`${prop.getName()}${opt}: ${expanded}`);
    }

    return `{ ${parts.join("; ")} }`;
  }

  // ── Fallback ────────────────────────────────────────────────────────────────
  return compilerChecker.typeToString(
    type,
    anchor,
    ts.TypeFormatFlags.NoTruncation,
  );
}

// ─── Code generation ─────────────────────────────────────────────────────────

if (routes.length === 0) {
  console.warn(
    "Warning: no routes found. Make sure your source files are included in tsconfig.json.",
  );
}

const importLine = `import { Elysia, t } from "elysia";`;

function buildOptions(route: Route): string {
  const opts: string[] = [];
  if (route.body) opts.push(`    body: ${route.body}`);
  if (route.params) opts.push(`    params: ${route.params}`);
  if (route.query) opts.push(`    query: ${route.query}`);
  if (!opts.length) return "";
  return `, {\n${opts.join(",\n")}\n  }`;
}

function buildHandler(returnType: string): string {
  if (returnType === "unknown") return "(): unknown => undefined";
  // "undefined as never" satisfies any return type annotation
  return `(): ${returnType} => undefined as never`;
}

const chain = routes
  .map(
    (r) =>
      `  .${r.method}("${r.path}", ${buildHandler(r.returnType)}${buildOptions(r)})`,
  )
  .join("\n");

const banner = [
  "// This file is auto-generated by nestelia-gen — do not edit manually.",
  "//",
  "// Re-generate with:",
  `//   bunx nestelia-gen ${outputArg ?? ""}`.trimEnd(),
].join("\n");

const output = `${banner}
${importLine}

export const appSchema = new Elysia()
${chain};

export type App = typeof appSchema;
`;

let existing: string | undefined;
try { existing = readFileSync(outputFile, "utf8"); } catch {}
if (existing !== output) {
  writeFileSync(outputFile, output, "utf8");
  console.log(`Written ${routes.length} routes → ${outputFile}`);
} else {
  console.log(`Up to date → ${outputFile}`);
}

process.exit(0);
