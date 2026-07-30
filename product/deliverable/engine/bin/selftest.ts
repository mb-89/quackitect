// The full engine suite as a boot condition — an ordinary SCRIPT condition
// (exit 0 = green), named by prepare_idle next to the preflight:
//   exit_script:
//     - product/deliverable/engine/bin/preflight.ts
//     - product/deliverable/engine/bin/selftest.ts
// RUNME runs only the sub-second preflight at startup (owner ruling
// 2026-07-26: launch must not wait five seconds); the SUITE runs here,
// inside boot, engine-observed — the agent cannot claim a green engine,
// only trigger the run.
//
//   node engine/bin/selftest.ts --root <project root>
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`selftest — the full engine test suite; exit 0 when green

  node engine/bin/selftest.ts --root <project root>

  --root  the project root. Default: the current directory.
  --help  this text (-h, -?)
`);
  process.exit(0);
}
// RECURSION GUARD: the suite itself walks boot machines in temp roots,
// and those walks hit prepare_idle's exit scripts — which would spawn the
// suite again, forever. The test helpers set this before any walk.
if (process.env.SE_SELFTEST_SKIP === "1") {
  process.stdout.write("selftest skipped — already inside a selftest run\n");
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
const dir = join(root, "product", "deliverable");
const testsDir = join(dir, "tests");
if (!existsSync(testsDir)) {
  process.stdout.write(`selftest: no tests at ${testsDir}\n`);
  process.exit(1);
}
const files = readdirSync(testsDir)
  .filter((f) => f.endsWith(".test.ts"))
  .map((f) => join("tests", f));
const r = spawnSync(process.execPath, ["--test", ...files], {
  cwd: dir,
  encoding: "utf8",
  timeout: 110_000,
  maxBuffer: 32 * 1024 * 1024,
  env: { ...process.env, SE_SELFTEST_SKIP: "1" },
});
const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
// The condition's evidence is the verdict, not the firehose: failures by
// name plus the tallies. (scriptRun caps output anyway — cap honestly.)
const summary = out
  .split("\n")
  .filter((l) => l.startsWith("not ok") || /^# (tests|suites|pass|fail) /.test(l))
  .join("\n");
process.stdout.write(`${summary || out.slice(-1500)}\n`);
process.exit(r.status ?? 1);
