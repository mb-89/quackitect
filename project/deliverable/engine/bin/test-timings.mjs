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
import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";

// selftest runs with cwd = project/deliverable, so the root is two up. A
// reporter has no argv of its own to be told this.
const ROOT = join(process.cwd(), "..", "..");
const OUT = join(ROOT, ".se", "test-timings.jsonl");

export default async function* timings(source) {
  const run = new Date().toISOString();
  const rows = [];
  for await (const event of source) {
    if (event.type !== "test:pass" && event.type !== "test:fail") continue;
    const d = event.data;
    // A SUITE reports the sum of its children, so counting it too would
    // double the total. Only leaves are the real cost.
    if (d.details?.type === "suite") continue;
    rows.push({
      run,
      file: d.file === undefined ? "" : relative(ROOT, d.file).split("\\").join("/"),
      name: String(d.name ?? ""),
      ms: Math.round(Number(d.details?.duration_ms ?? 0)),
      ok: event.type === "test:pass",
    });
  }
  try {
    mkdirSync(dirname(OUT), { recursive: true });
    appendFileSync(OUT, rows.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf8");
  } catch {
    // A suite must never fail because its bookkeeping could not be written.
  }
  yield "";
}
