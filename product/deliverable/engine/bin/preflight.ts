// The boot preflight — an ordinary condition SCRIPT (exit 0 = green).
// prepare_idle names it in its exit condition:
//   exit:
//     script: product/deliverable/engine/bin/preflight.ts
// The state declares WHAT runs; the engine only knows HOW to run scripts.
//
//   node engine/bin/preflight.ts --root <project root>
import { accessSync, constants, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { compileMachine } from "../machines/compile.ts";
import { rgPath } from "../search.ts";
import { resolveInRoot, seDir } from "../paths.ts";
import { type MachineDecl } from "../machine.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write("preflight — the boot checks; exit 0 when green\n\n  node engine/bin/preflight.ts --root <project root>\n");
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
const failures: string[] = [];

const machinesDir = join(root, "product", "deliverable", "machines");
const decls: MachineDecl[] = [];
for (const f of existsSync(machinesDir) ? readdirSync(machinesDir) : []) {
  if (!f.endsWith(".canvas")) continue;
  try {
    decls.push(compileMachine(root, join(machinesDir, f)));
  } catch (e) {
    failures.push(`machine ${f} does not compile: ${String((e as Error).message)}`);
  }
}
for (const d of decls) {
  for (const s of d.states) {
    for (const dict of [s.entry, s.exit]) {
      for (const p of dict?.read ?? []) {
        try {
          if (!existsSync(resolveInRoot(root, p, "preflight"))) failures.push(`${d.id}/${s.id}: read path missing: ${p}`);
        } catch {
          failures.push(`${d.id}/${s.id}: read path escapes the root: ${p}`);
        }
      }
      for (const p of dict?.script ?? []) {
        try {
          if (!existsSync(resolveInRoot(root, p, "preflight"))) failures.push(`${d.id}/${s.id}: condition script missing: ${p}`);
        } catch {
          failures.push(`${d.id}/${s.id}: condition script escapes the root: ${p}`);
        }
      }
    }
  }
}
try {
  rgPath();
} catch (e) {
  failures.push(String((e as Error).message));
}
if (spawnSync("git", ["--version"], { stdio: "ignore" }).status !== 0) failures.push("git does not answer — it is a hard dependency");
try {
  mkdirSync(seDir(root), { recursive: true });
  accessSync(dirname(join(seDir(root), "calls.jsonl")), constants.W_OK);
} catch {
  failures.push("the call log location is not writable (.se/)");
}

for (const f of failures) process.stdout.write(`${f}\n`);
if (failures.length === 0) process.stdout.write("preflight green\n");
process.exit(failures.length === 0 ? 0 : 1);
