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

import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { availableParallelism } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { killTree } from "../run.ts";

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
const dir = join(root, "project", "deliverable");
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
// THE CAP OUTGREW ITS SUITE ONCE (2026-08-02): the pull-lane tests pay a
// real boot walk each, the wall clock crossed the old 110s, and spawnSync
// KILLED the run mid-stream — truncated output, no summary, an exit code
// that read as ordinary failure. A cap that is hit must SAY so.
const CAP_MS = 300_000;
// The cap kills the WHOLE TREE — spawnSync killed only the runner and left
// its per-file workers orphaned (two held a folder lock for four hours,
// 2026-08-02).
const lastRunPath = join(root, ".se", "test-last-run.json");
const prior = (() => {
  try {
    const rec = JSON.parse(readFileSync(lastRunPath, "utf8")) as {
      wall_ms?: number;
      tests?: number;
      files?: { file: string; sum_ms: number; cases: number }[];
    };
    return {
      wall_ms: typeof rec.wall_ms === "number" ? rec.wall_ms : undefined,
      tests: typeof rec.tests === "number" ? rec.tests : undefined,
      files: new Map((rec.files ?? []).map((f) => [f.file, { sum_ms: f.sum_ms, cases: f.cases }])),
    };
  } catch {
    return { wall_ms: undefined, tests: undefined, files: new Map<string, { sum_ms: number; cases: number }>() };
  }
})();
const startedAt = Date.now();
// The reporter appends a beat per finished file; the header is the parent's,
// so a poll can answer N of M and a kill can name what never finished.
const progressPath = join(root, ".se", "test-progress.jsonl");
const expectedFiles = files.map((f) => `project/deliverable/${f.replace(/\\/g, "/")}`);
try {
  mkdirSync(join(root, ".se"), { recursive: true });
  writeFileSync(
    progressPath,
    `${JSON.stringify({ start: new Date(startedAt).toISOString(), files_total: expectedFiles.length, cores: availableParallelism(), ...(prior.tests !== undefined ? { tests_last_run: prior.tests } : {}) })}\n`,
    "utf8",
  );
} catch {
  // bookkeeping never blocks the run
}
// The cap's last act before the kill: photograph the still-living workers.
// What refuses to exit IS the diagnosis, and the kill destroys the evidence —
// the 60-file stall of 2026-08-03 died unnamed exactly this way.
let stuckWorkers = "";
function snapshotWorkers(): string {
  try {
    const r =
      process.platform === "win32"
        ? spawnSync(
            "powershell",
            [
              "-NoProfile",
              "-Command",
              'Get-CimInstance Win32_Process -Filter "Name=\'node.exe\'" | ForEach-Object { "$($_.ProcessId) ppid=$($_.ParentProcessId) $($_.CommandLine)" }',
            ],
            { encoding: "utf8", windowsHide: true, timeout: 10_000 },
          )
        : spawnSync("ps", ["-eo", "pid,args"], { encoding: "utf8", timeout: 10_000 });
    return (
      (r.stdout ?? "")
        .split("\n")
        .filter((l) => l.includes("tests\\") || l.includes("tests/"))
        // Head AND tail: a worker's argv can carry node's whole serialized
        // option set, and the script path — the name that matters — sits at
        // the very end. Two truncations lost it twice.
        .map((l) => {
          const t = l.trim();
          return `  ${t.length <= 340 ? t : `${t.slice(0, 100)} … ${t.slice(-220)}`}`;
        })
        .join("\n")
    );
  } catch {
    return "";
  }
}
const r = await new Promise<{ status: number | null; killed: boolean; out: string }>((resolveRun) => {
  const child = spawn(process.execPath, ["--test", ...REPORTERS, ...files], {
    cwd: dir,
    windowsHide: true,
    detached: process.platform !== "win32",
    env: { ...process.env, SE_SELFTEST_SKIP: "1" },
  });
  let acc = "";
  let killed = false;
  const timer = setTimeout(() => {
    killed = true;
    stuckWorkers = snapshotWorkers();
    killTree(child.pid);
  }, CAP_MS);
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (c: string) => {
    acc += c;
  });
  child.stderr?.on("data", (c: string) => {
    acc += c;
  });
  child.on("error", (e) => {
    clearTimeout(timer);
    resolveRun({ status: null, killed, out: acc + String(e) });
  });
  child.on("close", (code) => {
    clearTimeout(timer);
    resolveRun({ status: code, killed, out: acc });
  });
});
if (r.killed) {
  process.stdout.write(
    `selftest: KILLED at its ${CAP_MS / 1000}s cap — the run is TRUNCATED, the tallies below are not a verdict${prior.wall_ms !== undefined ? ` (the last completed battery took ${Math.round(prior.wall_ms / 1000)}s)` : ""}\n`,
  );
  // The beat stream outlives the kill. Completeness is judged against the
  // LAST run's per-file case counts — measured, never inferred from runner
  // internals. A file with no baseline is named unknown, never assumed done.
  try {
    const seen = new Map<string, { cases: number; ms: number }>();
    const fails: string[] = [];
    for (const line of readFileSync(progressPath, "utf8").split("\n").slice(1)) {
      if (line.trim() === "") continue;
      let rec: { file?: string; ms?: number; fail?: string; msg?: string };
      try {
        rec = JSON.parse(line);
      } catch {
        continue;
      }
      if (typeof rec.file !== "string") continue;
      const agg = seen.get(rec.file) ?? { cases: 0, ms: 0 };
      agg.cases += 1;
      agg.ms += Number(rec.ms ?? 0);
      seen.set(rec.file, agg);
      if (typeof rec.fail === "string")
        fails.push(`  ${rec.fail} (${rec.file})${typeof rec.msg === "string" && rec.msg !== "" ? ` — ${rec.msg}` : ""}`);
    }
    const complete: string[] = [];
    const partial: string[] = [];
    const untouched: string[] = [];
    for (const f of expectedFiles) {
      const base = prior.files.get(f);
      const got = seen.get(f);
      if (got === undefined) untouched.push(f);
      else if (base !== undefined && got.cases >= base.cases) complete.push(f);
      else partial.push(`  ${f} (${got.cases}${base !== undefined ? ` of ${base.cases}` : ""} cases, ${(got.ms / 1000).toFixed(1)}s)`);
    }
    process.stdout.write(`complete ${complete.length} of ${expectedFiles.length} files, by last-run case counts.\n`);
    if (partial.length > 0) process.stdout.write(`MID-FLIGHT at the kill:\n${partial.join("\n")}\n`);
    if (untouched.length > 0) process.stdout.write(`never started:\n${untouched.map((f) => `  ${f}`).join("\n")}\n`);
    const over = complete.filter((f) => {
      const base = prior.files.get(f);
      const got = seen.get(f);
      return base !== undefined && got !== undefined && got.ms > 2 * base.sum_ms && got.ms - base.sum_ms > 1000;
    });
    if (over.length > 0)
      process.stdout.write(
        `over their last-run baseline:\n${over.map((f) => `  ${f} ${((seen.get(f)?.ms ?? 0) / 1000).toFixed(1)}s (last run ${((prior.files.get(f)?.sum_ms ?? 0) / 1000).toFixed(1)}s)`).join("\n")}\n`,
      );
    if (fails.length > 0) process.stdout.write(`failures before the kill:\n${fails.join("\n")}\n`);
  } catch {
    // no beat stream — the reporter never started
  }
  if (stuckWorkers !== "") process.stdout.write(`workers alive at the kill — what refused to exit:\n${stuckWorkers}\n`);
}
// The reporter's record gains the wall clock — only a record THIS run wrote.
// A killed run leaves the old record standing, and yesterday's record must
// not wear today's wall.
try {
  const rec = JSON.parse(readFileSync(lastRunPath, "utf8")) as Record<string, unknown> & { run?: string };
  if (typeof rec.run === "string" && Date.parse(rec.run) >= startedAt) {
    rec.wall_ms = Date.now() - startedAt;
    writeFileSync(lastRunPath, `${JSON.stringify(rec, null, 1)}\n`, "utf8");
  }
} catch {
  // no fresh record — the reporter never finished; nothing to stamp
}
const out = r.out;
// The condition's evidence is the verdict, not the firehose: failures by
// name plus the tallies. (scriptRun caps output anyway — cap honestly.)
// BOTH REPORTER DIALECTS. TAP writes "not ok" and "# pass"; the spec
// reporter writes "✖" and "ℹ pass". This matched TAP only, and node's default
// moved to spec — so it quietly matched NOTHING and every run fell back to
// the last 1500 characters. A summary that stops summarising without saying
// so is worse than no summary, because the caller cannot tell.
// A dying test's WHY survives into the verdict: the spec reporter's closing
// "failing tests" section carries name, message and stack, and the old
// filter dropped everything but the ✖ name line.
const failingAt = out.search(/^✖ failing tests:/m);
const failingSection = failingAt >= 0 ? out.slice(failingAt) : "";
const summary = out
  .split("\n")
  .map((l) => l.trimEnd())
  .filter((l) => {
    const t = l.trimStart();
    if (l.startsWith("not ok")) return true;
    if (t.startsWith("✖")) return failingSection === "";
    return /^[#ℹ] (tests|suites|pass|fail) /.test(t);
  })
  .join("\n");
process.stdout.write(`${[summary, failingSection].filter((s) => s !== "").join("\n") || out.slice(-1500)}\n`);
process.exit(r.status ?? 1);
