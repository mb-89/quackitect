// see dsp-write-guard.md#the-conformance-sweep
import { sweepCorpus } from "../sweep.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();
const rel = argValue("--under") ?? "spec";

const began = Date.now();
const r = sweepCorpus(root, rel);
const took = Date.now() - began;

// THE COST IS PRINTED EVERY RUN, not measured once and written into a comment.
// A check that is cheap today and expensive in a year is how a boot gets slow
// without anybody deciding it should.
process.stdout.write(`sweep: ${String(r.scanned)} node(s) under ${rel} in ${String(took)} ms\n`);

// REPORTS PRINT ON EVERY RUN, green or red, and change nothing. They name what
// the sweep noticed and does not treat as a defect.
if (r.reports.length > 0) {
  process.stdout.write(`sweep notes ${String(r.reports.length)}:\n`);
  for (const line of r.reports) process.stdout.write(`- ${line}\n`);
}

if (r.findings.length === 0) {
  process.stdout.write("sweep green\n");
  process.exit(0);
}

process.stdout.write(`sweep RED — ${String(r.findings.length)} finding(s)\n\n`);
for (const f of r.findings) process.stdout.write(`- ${f.kind} · ${f.path} — ${f.says}\n`);
process.exitCode = 1;
