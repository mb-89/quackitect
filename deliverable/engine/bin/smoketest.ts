// see dsp-quality-toolchain.md#the-boot-smoke-test
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// NEVER process.exit() HERE. On Windows, exiting while a stdout write is
// still in flight aborts the process inside libuv — "Assertion failed:
// !(handle->flags & UV_HANDLE_CLOSING)", exit 3221226505 — and boot reads
// that as a red engine. Setting exitCode lets node drain and leave on its
// own, so the mode is chosen once and the work is nested under it.
const help = process.argv.some((a) => a === "--help" || a === "-h" || a === "-?");
// RECURSION GUARD, the same one selftest.ts carries. The suite walks boot
// machines inside COPIED temp roots, and those walks reach prepare_desk's
// exit scripts. Two reasons to stand down there: the walk would spawn the
// checks forever, and a copied root has no node_modules, so importing the
// engine's modules would fail on a missing dependency rather than on
// anything real. The test helpers set this before any walk.
const skip = process.env.SE_SELFTEST_SKIP === "1";

if (help) {
  process.stdout.write(`smoketest — the boot checks; exit 0 when green

  node engine/bin/smoketest.ts --root <project root>

  --root  the project root. Default: the current directory.
  --help  this text (-h, -?)

Proves the engine loads and answers. The FULL battery is selftest.ts,
which runs at validation, never at boot.
`);
} else if (skip) {
  process.stdout.write("smoke skipped — already inside a test run\n");
} else {
  const root = resolve(argValue("--root") ?? process.cwd());
  const engineDir = join(root, "deliverable", "engine");
  const BUDGET_MS = Number(process.env.SE_SMOKE_BUDGET_MS ?? 10_000);
  const started = Date.now();
  const failures: string[] = [];
  const url = (...p: string[]): string => `file://${join(...p).replaceAll("\\", "/")}`;

  const steps: { label: string; run: () => Promise<void> | void }[] = [
    {
      // THE MOST VALUABLE CHECK BY FAR. Every module is imported, so a
      // syntax error, a bad import or a broken top level anywhere in the
      // engine is caught here, not at the first tool call that reaches it.
      label: "engine modules load",
      run: async () => {
        const files = readdirSync(engineDir).filter((f) => f.endsWith(".ts"));
        await Promise.all(files.map((f) => import(url(engineDir, f))));
      },
    },
    {
      label: "machines compile",
      run: async () => {
        const { compileMachine } = await import(url(engineDir, "machines", "compile.ts"));
        const dir = join(root, "deliverable", "machines");
        for (const f of existsSync(dir) ? readdirSync(dir) : []) {
          if (f.endsWith(".canvas")) compileMachine(root, join(dir, f));
        }
      },
    },
    {
      label: "cards load",
      run: async () => {
        const { loadCards } = await import(url(engineDir, "cards.ts"));
        if (loadCards(root).length === 0) throw new Error("no cards — the mirror would render empty");
      },
    },
    {
      label: "rigor matrix reads",
      run: async () => {
        const { readRigorMatrix } = await import(url(engineDir, "rigor-matrix.ts"));
        if (readRigorMatrix(root).rows.length === 0) throw new Error("the rigor matrix has no rows — no machine could be compiled from it");
      },
    },
  ];

  // THE STEPS RUN TOGETHER where they can. software.md: work that leaves
  // nineteen of twenty cores idle is a defect. These four are independent,
  // because they read and never write.
  process.stdout.write(`##progress 0 ${steps.length} starting\n`);
  let done = 0;
  await Promise.all(
    steps.map(async (s) => {
      try {
        await s.run();
      } catch (e) {
        failures.push(`${s.label}: ${String((e as Error).message)}`);
      }
      done += 1;
      process.stdout.write(`##progress ${done} ${steps.length} ${s.label}\n`);
    }),
  );

  const elapsed = Date.now() - started;
  for (const f of failures) process.stdout.write(`${f}\n`);
  if (failures.length === 0) process.stdout.write(`smoke green in ${(elapsed / 1000).toFixed(1)}s\n`);
  // OVER BUDGET IS A FINDING, not a failure. Boot still passes; the line
  // is there so the drift shows the day it starts, not months later.
  if (elapsed > BUDGET_MS) {
    process.stdout.write(
      `smoke took ${(elapsed / 1000).toFixed(1)}s — over the ${(BUDGET_MS / 1000).toFixed(0)}s budget; something here has grown\n`,
    );
  }
  process.exitCode = failures.length === 0 ? 0 : 1;
}
