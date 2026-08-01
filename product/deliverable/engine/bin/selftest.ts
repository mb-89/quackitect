// The full engine suite — an ordinary SCRIPT condition (exit 0 = green).
//
// BOOT DOES NOT RUN THIS. Boot runs the PREFLIGHT and the SMOKE test, and
// nothing else: machines/states/prepare_idle.md names those two, and together
// they cost about half a second. This file is the full battery, ~74s over 359
// tests, and it is run deliberately — by se_test, or by hand before landing.
//
// THIS COMMENT USED TO SAY THE OPPOSITE, claiming prepare_idle listed it here
// beside the preflight. It does not, and has not: the owner's rule is that
// only smoke tests gate boot. A stale comment about what boot costs is worth
// correcting, because it is what anyone reads before deciding to restart.
//
// The agent cannot claim a green engine either way — only trigger the run.
// The ENGINE observes the result.
//
//   node engine/bin/selftest.ts --root <project root>
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

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
// EVERY RUN IS TIMED (owner ruling 2026-07-31). Two reporters: the ordinary
// one keeps the human output exactly as it was, and test-timings writes the
// per-test record to .se/ for the retro to read. A suite whose cost is only
// visible when somebody goes looking is a suite nobody measures.
const REPORTERS = [
  "--test-reporter=spec",
  "--test-reporter-destination=stdout",
  // A file:// URL, not a path. On Windows the ESM loader reads a bare
  // absolute path as the protocol "c:" and refuses.
  `--test-reporter=${pathToFileURL(join(dir, "engine", "bin", "test-timings.mjs")).href}`,
  "--test-reporter-destination=stderr",
];
const r = spawnSync(process.execPath, ["--test", ...REPORTERS, ...files], {
  cwd: dir,
  encoding: "utf8",
  timeout: 110_000,
  maxBuffer: 32 * 1024 * 1024,
  env: { ...process.env, SE_SELFTEST_SKIP: "1" },
});
const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
// The condition's evidence is the verdict, not the firehose: failures by
// name plus the tallies. (scriptRun caps output anyway — cap honestly.)
// BOTH REPORTER DIALECTS. TAP writes "not ok" and "# pass"; the spec
// reporter writes "✖" and "ℹ pass". This matched TAP only, and node's default
// moved to spec — so it quietly matched NOTHING and every run fell back to
// the last 1500 characters. A summary that stops summarising without saying
// so is worse than no summary, because the caller cannot tell.
const summary = out
  .split("\n")
  .map((l) => l.trimEnd())
  .filter((l) => {
    const t = l.trimStart();
    return l.startsWith("not ok") || t.startsWith("✖") || /^[#ℹ] (tests|suites|pass|fail) /.test(t);
  })
  .join("\n");
process.stdout.write(`${summary || out.slice(-1500)}\n`);
process.exit(r.status ?? 1);
