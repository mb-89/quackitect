// see dsp-write-guard.md#the-conformance-sweep
import { sweepCorpus } from "../sweep.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();

// THE THREE FOLDERS THE REQUIREMENT NAMES. A use case teaching a retired verb
// costs the next reader a refused call, and until this line the sweep only
// looked under `spec`, so guidance and the machines were never visited.
//
// req-the-dead-vocabulary-sweep-reaches-the-trace
const DEFAULT_AREAS = ["spec", "guidance", "deliverable/machines"];
const under = argValue("--under");
const areas = under === undefined ? DEFAULT_AREAS : [under];

const began = Date.now();
const swept = areas.map((area) => sweepCorpus(root, area));
const r = {
  scanned: swept.reduce((n, one) => n + one.scanned, 0),
  findings: swept.flatMap((one) => one.findings),
  // THE TOKEN REPORT IS WHOLE-POOL and every area answers with the same list,
  // so the areas after the first would repeat it.
  reports: [...new Set(swept.flatMap((one) => one.reports))],
};
const rel = areas.join(", ");
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
