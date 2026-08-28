// EVERY TEST IS TIMED, ALWAYS (owner ruling 2026-07-31). A suite's cost is
// not a thing to go looking for when it hurts; it is recorded on every run,
// and the retro reads the record.
//
// This is a node test reporter. It takes the runner's structured events —
// not parsed console text — so the durations are the runner's own numbers.
// It writes the record and prints nothing: selftest pairs it with the
// ordinary reporter, which keeps the human output unchanged.
//
// The record lands in .se/, machine-local and gitignored, beside the call
// log. It APPENDS, so the retro can see a test getting slower over weeks
// rather than only what one run happened to cost.
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

// THE SPAWNER TELLS IT WHERE TO WRITE. A reporter has no argv of its own, so
// it used to derive the root from its working directory — a guess about who
// spawned it, and wrong for any caller that does not chdir into
// deliverable. Every write below is inside a try that swallows its
// error, so a wrong guess loses the records without a sound.
//
// The cwd form stays as the fallback, for a hand-run that sets nothing.
const SE =
  process.env.SE_TIMINGS_DIR !== undefined && process.env.SE_TIMINGS_DIR !== ""
    ? process.env.SE_TIMINGS_DIR
    : join(process.cwd(), "..", "..", ".se");
const ROOT = dirname(SE);
const OUT = join(SE, "test-timings.jsonl");
// THE LAST RUN, STANDING (owner, 2026-08-02): one findable summary, replaced
// per run, so the retro reads the hotspots without aggregating the append log.
const LAST = join(SE, "test-last-run.json");

// THE BEAT FILE: one line per finished CASE, appended AS IT HAPPENS. The
// end-of-run record cannot serve a killed run; this stream survives any
// kill, so a poll reads live counts and a kill names what was mid-flight.
// Per-case, not per-suite: suite events fire once per top-level group, so
// counting them ran past the file total on the first real run.
const PROGRESS = join(SE, "test-progress.jsonl");

export default async function* timings(source) {
  const run = new Date().toISOString();
  const t0 = Date.now();
  const rows = [];
  const beat = (obj) => {
    try {
      appendFileSync(PROGRESS, `${JSON.stringify(obj)}\n`, "utf8");
    } catch {
      // bookkeeping never fails the suite
    }
  };
  // THE FOLDER IS MADE BEFORE THE FIRST BEAT, not after the last one.
  //
  // MEASURED 2026-08-25: two runs were abandoned after seven and twenty-three
  // minutes having written no beat at all, because the only mkdir stood at the
  // END of the stream. A run that never reaches its end therefore leaves
  // nothing, which is the exact case this file exists to serve.
  try {
    mkdirSync(SE, { recursive: true });
  } catch {
    // bookkeeping never fails the suite
  }
  // A HEADER OPENS EVERY RUN'S BEATS, so a reader can tell this run's lines
  // from the last one's. The battery used to write it and the scoped path did
  // not, so a scoped run's progress was indistinguishable from stale lines.
  beat({ run, started: run, pid: process.pid });
  for await (const event of source) {
    if (event.type !== "test:pass" && event.type !== "test:fail") continue;
    const d = event.data;
    // A SUITE reports the sum of its children, so counting it too would
    // double the total. Only leaves are the real cost.
    if (d.details?.type === "suite") continue;
    const row = {
      run,
      file: d.file === undefined ? "" : relative(ROOT, d.file).split("\\").join("/"),
      name: String(d.name ?? ""),
      ms: Math.round(Number(d.details?.duration_ms ?? 0)),
      ok: event.type === "test:pass",
    };
    rows.push(row);
    // A dying test streams its WHY the moment it dies.
    // EVERY BEAT NAMES ITS RUN. Without it a reader cannot tell this run's
    // lines from the last one's, and a stale tail reads exactly like a live
    // one — which is how two abandoned runs looked like runs that never
    // started at all.
    beat(
      row.ok
        ? { run, file: row.file, ms: row.ms, t: Date.now() - t0 }
        : {
            run,
            file: row.file,
            ms: row.ms,
            t: Date.now() - t0,
            fail: row.name,
            msg: String(d.details?.error?.message ?? d.details?.error ?? "")
              .split("\n")[0]
              .slice(0, 300),
          },
    );
  }
  try {
    mkdirSync(dirname(OUT), { recursive: true });
    appendFileSync(OUT, `${rows.map((r) => JSON.stringify(r)).join("\n")}\n`, "utf8");
    const byFile = new Map();
    for (const r of rows) {
      const f = r.file;
      const e = byFile.get(f) ?? { sum_ms: 0, max_case_ms: 0, cases: 0, failed: 0 };
      e.sum_ms += r.ms;
      e.max_case_ms = Math.max(e.max_case_ms, r.ms);
      e.cases += 1;
      if (!r.ok) e.failed += 1;
      byFile.set(f, e);
    }
    const files = [...byFile.entries()].sort((a, b) => b[1].sum_ms - a[1].sum_ms).map(([file, e]) => ({ file, ...e }));
    const summary = {
      run,
      tests: rows.length,
      failed: rows.filter((r) => !r.ok).length,
      summed_ms: files.reduce((a, f) => a + f.sum_ms, 0),
      // A file far above its siblings OWES AN EXPLANATION (retro.md). The
      // top of this list is where the explanations are owed.
      files,
    };
    writeFileSync(LAST, `${JSON.stringify(summary, null, 1)}\n`, "utf8");
  } catch {
    // A suite must never fail because its bookkeeping could not be written.
  }
  yield "";
}
