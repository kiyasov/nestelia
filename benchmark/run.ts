#!/usr/bin/env bun

import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// ── Config ───────────────────────────────────────────────────────────────────

const DURATION = process.env.DURATION || "10s";
const CONNECTIONS = Number(process.env.CONNECTIONS) || 500;
const PORT = 3000;
const WARMUP_DURATION = "2s";
const WARMUP_CONNECTIONS = 50;
const ROOT = resolve(import.meta.dir, "..");
const BENCH_DIR = import.meta.dir;

// ── Types ────────────────────────────────────────────────────────────────────

interface Framework {
  name: string;
  runtime: string;
  cmd: string[];
  cwd: string;
}

interface Scenario {
  name: string;
  description: string;
  method: "GET" | "POST";
  path: string;
  body?: string;
  contentType?: string;
}

interface Result {
  scenario: string;
  framework: string;
  runtime: string;
  reqsPerSec: number;
  latencyAvgUs: number;
}

// ── Scenarios ────────────────────────────────────────────────────────────────

const scenarios: Scenario[] = [
  {
    name: "Plain Text",
    description: 'GET / → "Hello World"',
    method: "GET",
    path: "/",
  },
  {
    name: "JSON",
    description: "GET /json → JSON object",
    method: "GET",
    path: "/json",
  },
  {
    name: "Path Params",
    description: "GET /user/:id → lookup by ID",
    method: "GET",
    path: "/user/2",
  },
  {
    name: "POST JSON",
    description: "POST /user → parse body, create",
    method: "POST",
    path: "/user",
    body: '{"name":"test","email":"test@test.com"}',
    contentType: "application/json",
  },
  {
    name: "DI + Service",
    description: "GET /users → service → array",
    method: "GET",
    path: "/users",
  },
];

// ── Frameworks ───────────────────────────────────────────────────────────────

const frameworks: Framework[] = [
  {
    name: "Nestelia",
    runtime: "Bun",
    cmd: ["bun", "run", "benchmark/src/nestelia.ts"],
    cwd: ROOT,
  },
  {
    name: "Elysia",
    runtime: "Bun",
    cmd: ["bun", "run", "benchmark/src/elysia.ts"],
    cwd: ROOT,
  },
  {
    name: "Fastify",
    runtime: "Node",
    cmd: ["node", "--import", "tsx", resolve(BENCH_DIR, "src/fastify.js")],
    cwd: resolve(BENCH_DIR),
  },
  {
    name: "Express",
    runtime: "Node",
    cmd: ["node", resolve(BENCH_DIR, "src/express.js")],
    cwd: resolve(BENCH_DIR),
  },
  {
    name: "NestJS",
    runtime: "Node",
    cmd: ["node", "--import", "tsx", resolve(BENCH_DIR, "src/nestjs.ts")],
    cwd: resolve(BENCH_DIR),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";

const COLORS: Record<string, string> = {
  Nestelia: MAGENTA,
  Elysia: CYAN,
  Fastify: YELLOW,
  Express: GREEN,
  NestJS: RED,
};

function detectBenchTool(): "bombardier" | null {
  try {
    execSync("which bombardier", { stdio: "ignore" });
    return "bombardier";
  } catch {
    return null;
  }
}

async function waitForServer(port: number, timeout = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) return true;
    } catch {}
    await Bun.sleep(100);
  }
  return false;
}

async function waitForPortFree(port: number, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fetch(`http://localhost:${port}/`);
      await Bun.sleep(200);
    } catch {
      return;
    }
  }
  try {
    execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: "ignore" });
    await Bun.sleep(500);
  } catch {}
}

function startServer(fw: Framework): ReturnType<typeof spawn> {
  return spawn(fw.cmd[0], fw.cmd.slice(1), {
    cwd: fw.cwd,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

async function killServer(proc: ReturnType<typeof spawn>) {
  proc.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    proc.on("close", () => resolve());
    setTimeout(() => {
      proc.kill("SIGKILL");
      resolve();
    }, 3000);
  });
  await waitForPortFree(PORT);
}

function runBombardier(scenario: Scenario, duration: string, connections: number): string {
  const url = `http://localhost:${PORT}${scenario.path}`;
  let cmd = `bombardier -c ${connections} -d ${duration} --print r --format json`;

  if (scenario.method === "POST") {
    cmd += ` -m POST`;
    if (scenario.body) cmd += ` -b '${scenario.body}'`;
    if (scenario.contentType) cmd += ` -H "Content-Type: ${scenario.contentType}"`;
  }

  return execSync(`${cmd} ${url}`, { encoding: "utf-8", timeout: 120000 });
}

function parseResult(json: string): { reqsPerSec: number; latencyAvgUs: number } {
  const data = JSON.parse(json);
  return {
    reqsPerSec: Math.round(data.result.rps.mean),
    latencyAvgUs: Math.round(data.result.latency.mean),
  };
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

// ── Display ──────────────────────────────────────────────────────────────────

function printResults(results: Result[], toRun: Framework[]) {
  const scenarioNames = scenarios.map((s) => s.name);
  const frameworkNames = toRun.map((f) => f.name);
  const BAR_WIDTH = 40;

  // Per-scenario bar charts
  for (const sName of scenarioNames) {
    const rows = results
      .filter((r) => r.scenario === sName)
      .sort((a, b) => b.reqsPerSec - a.reqsPerSec);
    if (rows.length === 0) continue;

    const scenario = scenarios.find((s) => s.name === sName)!;
    const maxRps = rows[0].reqsPerSec;

    console.log();
    console.log(`  ${BOLD}${sName}${RESET} ${DIM}${scenario.description}${RESET}`);
    console.log(`  ${DIM}${"─".repeat(64)}${RESET}`);

    for (const r of rows) {
      const c = COLORS[r.framework] || "";
      const barLen = Math.round((r.reqsPerSec / maxRps) * BAR_WIDTH);
      console.log(
        `  ${c}${BOLD}${r.framework.padEnd(10)}${RESET} ${DIM}${r.runtime.padEnd(5)}${RESET} ${c}${"█".repeat(barLen)}${RESET}${" ".repeat(BAR_WIDTH - barLen)} ${BOLD}${fmt(r.reqsPerSec).padStart(7)}${RESET} reqs/s`,
      );
    }
  }

  // Summary table
  console.log();
  console.log(`  ${BOLD}Summary (reqs/s)${RESET}`);
  console.log();

  const header = `  ${BOLD}${"".padEnd(12)}${scenarioNames.map((s) => s.padStart(12)).join("")}${"Avg".padStart(12)}${RESET}`;
  console.log(header);
  console.log(`  ${DIM}${"─".repeat(12 + scenarioNames.length * 12 + 12)}${RESET}`);

  const avgs = new Map<string, number>();
  for (const fName of frameworkNames) {
    const c = COLORS[fName] || "";
    let row = `  ${c}${fName.padEnd(12)}${RESET}`;
    let total = 0;
    let count = 0;

    for (const sName of scenarioNames) {
      const r = results.find((r) => r.scenario === sName && r.framework === fName);
      if (r) {
        row += fmt(r.reqsPerSec).padStart(12);
        total += r.reqsPerSec;
        count++;
      } else {
        row += "—".padStart(12);
      }
    }

    const avg = count > 0 ? Math.round(total / count) : 0;
    avgs.set(fName, avg);
    row += `${BOLD}${fmt(avg).padStart(12)}${RESET}`;
    console.log(row);
  }

  // Comparisons
  console.log();
  const nesteliaAvg = avgs.get("Nestelia") ?? 0;
  const elysiaAvg = avgs.get("Elysia") ?? 0;

  if (elysiaAvg > 0 && nesteliaAvg > 0) {
    const overhead = (((elysiaAvg - nesteliaAvg) / elysiaAvg) * 100).toFixed(1);
    console.log(`  ${MAGENTA}${BOLD}~${overhead}%${RESET} avg overhead vs plain Elysia ${DIM}(DI + decorators + params)${RESET}`);
  }

  for (const [name, avg] of avgs) {
    if (name === "Nestelia" || name === "Elysia" || avg === 0 || nesteliaAvg === 0) continue;
    console.log(`  ${MAGENTA}${BOLD}${(nesteliaAvg / avg).toFixed(1)}x${RESET} faster than ${name} ${DIM}(avg)${RESET}`);
  }

  console.log();
  console.log(`  ${DIM}${CONNECTIONS} connections, ${DURATION} per scenario. Higher is better.${RESET}`);
  console.log();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!detectBenchTool()) {
    console.error(`\n  bombardier not found. Install: brew install bombardier\n`);
    process.exit(1);
  }

  console.log();
  console.log(`  ${BOLD}Nestelia Benchmark${RESET} ${DIM}(${CONNECTIONS} connections, ${DURATION}, ${scenarios.length} scenarios)${RESET}`);

  if (!existsSync(resolve(BENCH_DIR, "node_modules"))) {
    console.log(`  ${DIM}Installing benchmark dependencies...${RESET}`);
    execSync("bun install", { cwd: BENCH_DIR, stdio: "inherit" });
  }

  const only = process.argv
    .slice(2)
    .filter((a) => !a.startsWith("-"))
    .map((s) => s.toLowerCase());

  const toRun = only.length > 0
    ? frameworks.filter((fw) => only.includes(fw.name.toLowerCase()))
    : frameworks;

  const allResults: Result[] = [];

  for (const fw of toRun) {
    const c = COLORS[fw.name] || "";
    console.log();
    console.log(`  ${c}${BOLD}${fw.name}${RESET} ${DIM}(${fw.runtime})${RESET}`);

    const proc = startServer(fw);
    const ready = await waitForServer(PORT);

    if (!ready) {
      console.log(`    ${RED}server did not start${RESET}`);
      await killServer(proc);
      continue;
    }

    for (const scenario of scenarios) {
      process.stdout.write(`    ${DIM}${scenario.name.padEnd(14)}${RESET} `);

      try { runBombardier(scenario, WARMUP_DURATION, WARMUP_CONNECTIONS); } catch {}

      try {
        const parsed = parseResult(runBombardier(scenario, DURATION, CONNECTIONS));
        allResults.push({
          scenario: scenario.name,
          framework: fw.name,
          runtime: fw.runtime,
          ...parsed,
        });
        console.log(`${BOLD}${fmt(parsed.reqsPerSec).padStart(8)}${RESET} reqs/s`);
      } catch {
        console.log(`${RED}FAILED${RESET}`);
      }
    }

    await killServer(proc);
    await Bun.sleep(1000);
  }

  if (allResults.length > 0) {
    printResults(allResults, toRun);

    await Bun.write(
      resolve(BENCH_DIR, "results.json"),
      JSON.stringify({
        date: new Date().toISOString(),
        connections: CONNECTIONS,
        duration: DURATION,
        system: { platform: process.platform, arch: process.arch, bun: Bun.version, node: execSync("node --version", { encoding: "utf-8" }).trim() },
        results: allResults,
      }, null, 2),
    );
    console.log(`  ${DIM}Results saved to benchmark/results.json${RESET}`);
    console.log();
  }
}

main().catch(console.error);
