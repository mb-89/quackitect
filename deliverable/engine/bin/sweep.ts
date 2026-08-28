// see dsp-write-guard.md#the-conformance-sweep
// see dsp-the-door-rule.md#responsibility
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DOORS, strays as doorStrays, entryPoints, governedCount, unreachedEntryPoints } from "../doors.ts";
import { sweepCorpus } from "../sweep.ts";
import { strays } from "../widgets.ts";

// AN UNRESOLVED MARKER IN A SIGNED ARTIFACT (i4).
//
// The item templates ban these in a node's `statement`, and the write guard
// refuses one there. Everywhere else in the same file they landed silently and
// waited for a reader who happened to look.
//
// THE MARKERS ARE THE TEMPLATES' OWN, so there is one vocabulary rather than
// two: TBD, TBC, TBR and a bare row of question marks.
const MARKERS = /(^|[^A-Za-z])(TBD|TBC|TBR|\?\?\?)([^A-Za-z]|$)/;

// IT READS FIELDS, NOT PROSE, and that is the whole difference between a
// finding and a false positive.
//
// MEASURED. The first version scanned whole files and returned 33
// hits, of which nearly every one was an evidence form SAYING the marker sweep
// found nothing. A check that flags the rule for stating itself is noise.
//
// A MARKER IN A FIELD IS UNRESOLVED. A marker in a paragraph is somebody
// talking about markers, and they are allowed to.

function markerHits(dir: string, out: { path: string; line: number; says: string }[] = []) {
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      markerHits(full, out);
      continue;
    }
    if (!name.endsWith(".md")) continue;
    // A BYTE-ORDER MARK IS NOT CONTENT. Comparing the raw first line meant a
    // file saved with one was skipped silently, which reads as green.
    const lines = readFileSync(full, "utf8").replace(/^﻿/, "").split("\n");
    if (lines[0].trim() !== "---") continue;
    const close = lines.indexOf("---", 1);
    if (close < 0) continue;
    for (let i = 1; i < close; i++) {
      if (MARKERS.test(lines[i])) out.push({ path: full, line: i + 1, says: lines[i].trim().slice(0, 120) });
    }
  }
  return out;
}

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = argValue("--root") ?? process.cwd();

// THE THREE FOLDERS THE REQUIREMENT NAMES. A use case teaching a retired verb
// costs the next reader a refused call, and until this line the corpus sweep
// only looked under `spec`, so guidance and the machines were never visited.
//
// req-the-dead-vocabulary-sweep-reaches-the-trace
const DEFAULT_AREAS = ["spec", "guidance", "deliverable/machines"];
const under = argValue("--under");
const areas = under === undefined ? DEFAULT_AREAS : [under];

// THE MARKER SWEEP STAYS ON THE FIRST AREA, and its own comment below says why:
// pointed at `deliverable/machines/` it flags the item templates for LISTING
// the banned markers, which is the rule stating itself. The corpus sweep has no
// such problem and widens.
const rel = areas[0];

const began = Date.now();
const swept = areas.map((area) => sweepCorpus(root, area));
const r = {
  scanned: swept.reduce((n, one) => n + one.scanned, 0),
  findings: swept.flatMap((one) => one.findings),
  // THE TOKEN REPORT IS WHOLE-POOL and every area answers with the same list,
  // so the areas after the first would repeat it.
  reports: [...new Set(swept.flatMap((one) => one.reports))],
};
const took = Date.now() - began;

// THE COST IS PRINTED EVERY RUN, not measured once and written into a comment.
// A check that is cheap today and expensive in a year is how a boot gets slow
// without anybody deciding it should.
process.stdout.write(`sweep: ${String(r.scanned)} node(s) under ${areas.join(", ")} in ${String(took)} ms\n`);

// REPORTS PRINT ON EVERY RUN, green or red, and change nothing. They name what
// the sweep noticed and does not treat as a defect.
if (r.reports.length > 0) {
  process.stdout.write(`sweep notes ${String(r.reports.length)}:\n`);
  for (const line of r.reports) process.stdout.write(`- ${line}\n`);
}

// THE SECOND HALF OF THE WIDGET GUARD. The write refuses what a write brought;
// this finds what arrived some other way — a rename, a merge, a registry line
// deleted out from under a module still emitting.
//
// SAME RULE, SAME LISTS. widgets.ts owns the question and both callers ask it,
// so there is no second copy to drift.
// THE MARKER SWEEP RUNS OVER THE SAME TREE THE CORPUS SWEEP DOES, so `--under`
// moves both rather than one. Pointing it at `deliverable/machines/` would
// flag the item templates for LISTING these markers as banned, which is the
// rule stating itself.
const markers = markerHits(join(root, rel));
if (markers.length > 0) {
  process.stdout.write(`\nunresolved markers — ${String(markers.length)} in signed artifacts\n`);
  for (const h of markers.slice(0, 40)) process.stdout.write(`- ${h.path}:${String(h.line)} — ${h.says}\n`);
  if (markers.length > 40) process.stdout.write(`  and ${String(markers.length - 40)} more\n`);
  process.stdout.write("resolve each, or say the thing the marker was standing in for\n");
} else {
  process.stdout.write("markers green\n");
}

// THE SWEEP KNOWS WHICH TREE IT IS CHECKING, so the guard reads that tree's
// exemption list rather than the one beside its own file. Those are the same
// place only when the engine sits inside the product it checks.
const emitters = strays(root);
if (emitters.length > 0) {
  process.stdout.write(`\nwidget guard RED — ${String(emitters.length)} unregistered emitter(s)\n`);
  for (const path of emitters) process.stdout.write(`- ${path}\n`);
  process.stdout.write(
    "register each in deliverable/engine/editors/index.ts, declare it in deliverable/machines/widget-exemptions.md, or fold it into the one surface\n",
  );
} else {
  process.stdout.write("widget guard green\n");
}

// THE DOOR RULE'S OWN HALF. The write guard answers about one file and cannot
// see a break no write arrived with, nor a reach made through a spawned
// process. This is the complete check.
//
// IT SHIPS AT WARN. A new guard warns first and only starts refusing once its
// warn rate is near zero, which is the craft rule's own ladder. Most of the
// engine reaches the disk conversation and moving them is a record of its own, so
// blocking now would fail every boot for a state nobody has had a chance to
// fix. What it would take to block is written into the line it prints.
// A SWEEP THAT LOOKED AT NOTHING MUST NOT REPORT GREEN. dsp-the-door-sweep
// says so by name, and note-c545c46b8e56 records the same defect elsewhere.
// The root is caller-supplied, so a typo in it emptied every list at once.
let doorWarnings = 0;
let unchecked = 0;
for (const d of DOORS) {
  if (governedCount(d.id, root) === 0) {
    unchecked += 1;
    process.stdout.write(`\ndoor ${d.id} UNCHECKED — it governs no file under ${root}\n`);
    process.stdout.write(
      "an empty finding list here means nothing was looked at, not that nothing is wrong. Check the root names the repository root.\n",
    );
    continue;
  }
  const undeclared = doorStrays(d.id, root);
  doorWarnings += undeclared.length;
  if (undeclared.length === 0) {
    process.stdout.write(`door ${d.id} green\n`);
    continue;
  }
  process.stdout.write(`\ndoor ${d.id} WARNS — ${String(undeclared.length)} undeclared reach(es)\n`);
  for (const path of undeclared.slice(0, 10)) process.stdout.write(`- ${path}\n`);
  if (undeclared.length > 10) process.stdout.write(`  and ${String(undeclared.length - 10)} more\n`);
  process.stdout.write(
    `declare each in deliverable/machines/doors.md with its reason, or route the reach through the door. It warns rather than refusing while the count is this high, and blocks once it is near zero. What this rule cannot see: ${d.governs}\n`,
  );
}

// GOAL TWO OF THIS RECORD, ANSWERED EVERY RUN. An entry point nothing invokes
// is working code nobody can reach, which is the shape that went unnoticed
// while a hand-written list of six stood for twenty-nine.
const unreached = unreachedEntryPoints(root);
if (entryPoints(root).length === 0) {
  unchecked += 1;
  process.stdout.write(`\nentry points UNCHECKED — none found under ${root}\n`);
} else if (unreached.length > 0) {
  process.stdout.write(`\nentry points WARN — ${String(unreached.length)} that nothing invokes\n`);
  for (const path of unreached) process.stdout.write(`- ${path}\n`);
  process.stdout.write("answer each with a door, a deletion, or the invocation somebody forgot\n");
} else {
  process.stdout.write("entry points green\n");
}

if (unchecked > 0) {
  process.stdout.write(`\nsweep NOT GREEN — ${String(unchecked)} rule(s) looked at nothing\n`);
  process.exit(1);
}

if (r.findings.length === 0 && emitters.length === 0 && markers.length === 0) {
  const warns = doorWarnings + unreached.length;
  process.stdout.write(warns === 0 ? "sweep green\n" : `sweep green, with ${String(warns)} warning(s) above\n`);
  process.exit(0);
}

if (r.findings.length > 0) {
  process.stdout.write(`sweep RED — ${String(r.findings.length)} finding(s)\n\n`);
  for (const f of r.findings) process.stdout.write(`- ${f.kind} · ${f.path} — ${f.says}\n`);
}
process.exitCode = 1;
