// THE CONFORMANCE SWEEP, as a condition script (exit 0 = green).
//
//   node project/deliverable/engine/bin/sweep.ts --root <project root>
//
// THERE IS NO VERB FOR THIS, ON PURPOSE (owner ruling 2026-08-16). A verb an
// agent can call is a verb an agent will call, over and over, and the whole
// point of moving a check out of the write is that it costs too much to run
// per write. So the sweep runs where the ENGINE decides, at moments that are
// mechanically clear:
//
//   - THE BOOT, in prepare_idle's exit, beside preflight and the smoke test.
//     Every session starts on a corpus somebody has read.
//   - sweep-consistency's OWN EXIT. That row's job is "everything this
//     iteration changed is re-documented where it is taught", and it is
//     floor: true — never struck at any size. The findings land in front of
//     the state whose job is fixing them.
//   - THE TEST DECISION, when the diff is mostly DOCUMENTS. `decideScope`
//     already reads what changed to size a test run; a diff of prose and trace
//     nodes is exactly the change a test battery says nothing about and a
//     sweep says everything about.
//
// WHAT IT REPORTS. Four kinds, all from sweep.ts: a node that will not parse,
// a value outside its key's vocabulary, a rule with no way forward, and a rule
// bound to a node the corpus does not hold.
//
// EXIT 1 ON FINDINGS, because a condition script's exit code IS the condition.
// The write guard REPORTS a standing break and lands the write
// (req-a-standing-break-reports-and-lands); the sweep is where the same break
// finally blocks something, and the thing it blocks is leaving a state whose
// job was to clear it.
import { sweepCorpus } from "../sweep.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();
const rel = argValue("--under") ?? "project/spec";

const began = Date.now();
const r = sweepCorpus(root, rel);
const took = Date.now() - began;

// THE COST IS PRINTED EVERY RUN, not measured once and written into a comment.
// A check that is cheap today and expensive in a year is how a boot gets slow
// without anybody deciding it should.
process.stdout.write(`sweep: ${String(r.scanned)} node(s) under ${rel} in ${String(took)} ms\n`);

if (r.findings.length === 0) {
  process.stdout.write("sweep green\n");
  process.exit(0);
}

process.stdout.write(`sweep RED — ${String(r.findings.length)} finding(s)\n\n`);
for (const f of r.findings) process.stdout.write(`- ${f.kind} · ${f.path} — ${f.says}\n`);
process.exitCode = 1;
