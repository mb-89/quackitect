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
  process.stdout.write(`preflight — the boot checks; exit 0 when green

  node engine/bin/preflight.ts --root <project root>

  --root  the project root. Default: the current directory.
  --help  this text (-h, -?)
`);
  process.exit(0);
}

// During the suite run, every boot walk would run preflight again.
// Skip it there; the suite's top-level preflight already covers this check.
if (process.env.SE_SELFTEST_SKIP === "1") {
  process.stdout.write("preflight skipped — already inside a selftest run\n");
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
// THE SHELL IS NOT COVERED BY THE SUITE. Nothing imports extension.js, so a
// syntax error in it ships GREEN and VS Code then loads no extension at all,
// silently. That happened on 2026-07-30: a backtick inside a comment ended
// the template literal the webview's script lives in. Parsing the file is the
// whole guard, and it costs one spawn.
const shell = join(root, "product", "deliverable", "vscode", "extension.js");
if (existsSync(shell)) {
  const parsed = spawnSync(process.execPath, ["--check", shell], { encoding: "utf8" });
  if (parsed.status !== 0) {
    const line = String(parsed.stderr ?? "").split("\n").map((l) => l.trim()).find((l) => l.includes("Error"));
    failures.push(`the VS Code shell does not parse: ${line ?? "run node --check on it"}`);
  }
}
// THE PRODUCT'S CONFIGURATION. Both are read live, and both fall back
// SILENTLY on purpose — a missing brand.json must never leak the name of
// whichever product the source last belonged to, and a missing palette.css
// must not take every surface down over a colour.
//
// Silent is right at render time and wrong at boot. A product running under
// the fallback name in fallback colours is a broken install, not a choice,
// and preflight is where that gets said out loud.
if (!existsSync(join(root, "product", "brand.json"))) {
  failures.push("product/brand.json is missing — the product would run unnamed, under the lane's own fallback");
}
if (!existsSync(join(root, "product", "palette.css"))) {
  failures.push("product/palette.css is missing — every surface would render from the baked fallback palette");
}
try {
  mkdirSync(seDir(root), { recursive: true });
  accessSync(dirname(join(seDir(root), "calls.jsonl")), constants.W_OK);
} catch {
  failures.push("the call log location is not writable (.se/)");
}

for (const f of failures) process.stdout.write(`${f}\n`);
if (failures.length === 0) process.stdout.write("preflight green\n");
process.exit(failures.length === 0 ? 0 : 1);
