// THE TIMING REPORTER'S WIRING, in one place.
//
// The battery attached it and the scoped path did not, so a file could only
// be timed inside a run where twenty files contend and no duration is its
// own. Both paths now build their argv here.
//
// AND THE REPORTER IS TOLD WHERE TO WRITE. It used to derive the root from
// its own working directory, which is a guess about who spawned it — its own
// comment said as much. A reporter that guesses wrong writes its records
// somewhere nobody reads, and every write in it is inside a try that swallows
// the error, so it does that silently.
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** The env key the reporter reads its output directory from. */
export const TIMINGS_DIR_ENV = "SE_TIMINGS_DIR";

/** node --test reporter flags: the human one on stdout, the timing one on stderr.
 *
 *  `human` is `spec` for the battery, whose output a person reads, and `tap`
 *  for a scoped run, whose output is parsed.
 *
 *  THE REPORTER IS FOUND FROM THE ENGINE, never from the tree under test. It
 *  ships with the engine, and a root being tested may hold no engine at all —
 *  which is every fixture root, and is why the first attempt at this fix
 *  resolved to a path that does not exist. A file:// URL, not a path: on
 *  Windows the ESM loader reads a bare absolute path as the protocol "c:". */
export function testReporterArgs(human: "spec" | "tap"): string[] {
  return [
    `--test-reporter=${human}`,
    "--test-reporter-destination=stdout",
    `--test-reporter=${new URL("./bin/test-timings.mjs", import.meta.url).href}`,
    "--test-reporter-destination=stderr",
  ];
}

/** How many timing rows this run wrote.
 *
 *  Counted rather than trusted: the verdict reports it, so a run whose
 *  bookkeeping went nowhere says so instead of reading like one whose records
 *  landed. */
export function timedSince(seDir: string, sinceMs: number): number {
  let text: string;
  try {
    text = readFileSync(join(seDir, "test-timings.jsonl"), "utf8");
  } catch {
    return 0;
  }
  let n = 0;
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    let rec: { run?: string };
    try {
      rec = JSON.parse(line) as { run?: string };
    } catch {
      continue;
    }
    if (typeof rec.run === "string" && Date.parse(rec.run) >= sinceMs) n += 1;
  }
  return n;
}

/** The fan-out cap, sized from the machine and never from a constant.
 *
 *  The engine is one process on the same cores the test workers take. With
 *  the runner's default — one worker per file up to the core count — a run
 *  saturates every core and the lane stops answering while it is in flight.
 *
 *  One core is held back for the engine. The owner's objection to a fixed
 *  number is why this reads the count at run time rather than carrying one. */
export function testConcurrency(cores: number): number {
  return Math.max(1, cores - 1);
}

/** The timing half of a run's verdict.
 *
 *  A run that timed everything says so with a number. A run that timed less
 *  than it ran says THAT, in the same answer that reports the pass count,
 *  because a bookkeeping failure nobody is told about is the defect this
 *  whole seam exists to stop. */
export function timingReport(timed: number, total: number): Record<string, unknown> {
  if (timed >= total) return { timed };
  return { timed, timing_gap: `${String(total - timed)} of ${String(total)} cases left no timing record` };
}
