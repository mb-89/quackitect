// The boot preflight — an ordinary condition SCRIPT (exit 0 = green).
// prepare_idle names it in its exit condition:
//   exit:
//     script: project/deliverable/engine/bin/preflight.ts
// The state declares WHAT runs; the engine only knows HOW to run scripts.
//
//   node engine/bin/preflight.ts --root <project root>

import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { MachineDecl } from "../machine.ts";
import { compileMachine } from "../machines/compile.ts";
import { resolveInRoot, seDir } from "../paths.ts";
import { assembleProtocol, protocolTargets, textFor } from "../promptlayer.ts";
import { rgPath } from "../search.ts";

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

// A RAW NUL MAKES A WHOLE FILE INVISIBLE TO SEARCH, and says nothing about
// it. ripgrep calls the file binary and reports it unreadable, so a searcher
// reasons from a hole. Twice in four days, both times in engine sources, both
// times as a hash separator written raw instead of as the escape.
//
// The lane's write doors correct it at the source now, so an agent cannot
// make one. A file can still ARRIVE without passing through them — git apply
// brought the last one in, and the extension and the generators write
// directly too. The battery already catches it, but only when someone runs
// the battery. This speaks at boot, which is the next time anybody looks.
const scanForNul = (dir: string): void => {
  for (const e of existsSync(dir) ? readdirSync(dir, { withFileTypes: true }) : []) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules") scanForNul(p);
      continue;
    }
    if (!e.name.endsWith(".ts") && !e.name.endsWith(".js")) continue;
    if (readFileSync(p).includes(0)) {
      failures.push(
        `${p} carries a raw NUL byte — every lane search over this file answers nothing. Write the separator as the escape \\0.`,
      );
    }
  }
};
scanForNul(join(root, "project", "deliverable", "engine"));
scanForNul(join(root, "project", "deliverable", "vscode"));

// THE PLACED PROMPT LAYER MUST BE THE PROJECTION OF ITS SOURCE. Boot no
// longer reads the contract, so the prompt layer IS how an agent receives it.
// A stale placement would mean an agent walking under yesterday's rules; a
// missing one would mean an agent walking under none. Neither says anything
// on its own, which is exactly why this check exists.
try {
  const projection = assembleProtocol(root);
  for (const t of protocolTargets(join(root, "project"))) {
    if (!existsSync(t.path)) {
      // AGENTS.md is the door every host reads. The other two are per-host
      // conveniences, and a host that is not installed leaves none behind.
      if (t.path.endsWith("AGENTS.md"))
        failures.push(
          `${t.path} is MISSING — the prompt layer was never placed, so nothing carries the contract. Run engine/bin/place-prompt-layer.ts.`,
        );
      continue;
    }
    if (readFileSync(t.path, "utf8") !== textFor(t, projection)) {
      failures.push(`${t.path} is STALE — it is not the projection of project/guidance/. Run engine/bin/place-prompt-layer.ts.`);
    }
  }
} catch (e) {
  failures.push(`the prompt layer could not be assembled: ${String((e as Error).message)}`);
}

const machinesDir = join(root, "project", "deliverable", "machines");
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
// THE PRE-COMMIT HOOK RIDES THE REPO, but core.hooksPath is per-clone — so
// every preflight re-points it. Idempotent, ~50ms, and no clone can forget.
if (existsSync(join(root, "project", "deliverable", "hooks", "pre-commit"))) {
  spawnSync("git", ["config", "core.hooksPath", "project/deliverable/hooks"], { cwd: root, stdio: "ignore" });
}
// THE SHELL IS NOT COVERED BY THE SUITE. Nothing imports extension.js, so a
// syntax error in it ships GREEN and VS Code then loads no extension at all,
// silently. That happened on 2026-07-30: a backtick inside a comment ended
// the template literal the webview's script lives in.
//
// Parsing the file is only HALF the guard. The webview's own scripts live
// inside template literals, so to the outer parser they are just text: a
// syntax error in one ships green, the pane renders, its script throws, and
// the pane is silently dead. Each script body is therefore parsed on its own.
const shell = join(root, "project", "deliverable", "vscode", "extension.js");
if (existsSync(shell)) {
  const parsed = spawnSync(process.execPath, ["--check", shell], { encoding: "utf8" });
  if (parsed.status !== 0) {
    const line = String(parsed.stderr ?? "")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.includes("Error"));
    failures.push(`the VS Code shell does not parse: ${line ?? "run node --check on it"}`);
  } else {
    const source = readFileSync(shell, "utf8");
    const blocks = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
    blocks.forEach((m, i) => {
      // ${...} is host-side interpolation, not part of the script's grammar.
      // Blanking it leaves the structure a parser can judge.
      const body = m[1].replace(/\$\{[\s\S]*?\}/g, '""');
      try {
        new Function(body);
      } catch (e) {
        const before = source.slice(0, m.index ?? 0);
        const line = before.split("\n").length;
        failures.push(`the VS Code webview script #${i + 1} (near line ${line}) does not parse: ${String((e as Error).message)}`);
      }
    });
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
if (!existsSync(join(root, "project", "brand", "brand.json"))) {
  failures.push("project/brand/brand.json is missing — the product would run unnamed, under the lane's own fallback");
}
if (!existsSync(join(root, "project", "brand", "palette.css"))) {
  failures.push("project/brand/palette.css is missing — every surface would render from the baked fallback palette");
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
