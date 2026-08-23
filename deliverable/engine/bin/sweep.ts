// see dsp-write-guard.md#the-conformance-sweep
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { sweepCorpus } from "../sweep.ts";
import { strays } from "../widgets.ts";

// AN UNRESOLVED MARKER IN A SIGNED ARTIFACT (i4, 2026-08-23).
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
// MEASURED 2026-08-23. The first version scanned whole files and returned 33
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
const rel = argValue("--under") ?? "spec";

const began = Date.now();
const r = sweepCorpus(root, rel);
const took = Date.now() - began;

// THE COST IS PRINTED EVERY RUN, not measured once and written into a comment.
// A check that is cheap today and expensive in a year is how a boot gets slow
// without anybody deciding it should.
process.stdout.write(`sweep: ${String(r.scanned)} node(s) under ${rel} in ${String(took)} ms\n`);

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

const emitters = strays();
if (emitters.length > 0) {
  process.stdout.write(`\nwidget guard RED — ${String(emitters.length)} unregistered emitter(s)\n`);
  for (const path of emitters) process.stdout.write(`- ${path}\n`);
  process.stdout.write(
    "register each in deliverable/engine/editors/index.ts, declare it in deliverable/machines/widget-exemptions.md, or fold it into the one surface\n",
  );
} else {
  process.stdout.write("widget guard green\n");
}

if (r.findings.length === 0 && emitters.length === 0 && markers.length === 0) {
  process.stdout.write("sweep green\n");
  process.exit(0);
}

if (r.findings.length > 0) {
  process.stdout.write(`sweep RED — ${String(r.findings.length)} finding(s)\n\n`);
  for (const f of r.findings) process.stdout.write(`- ${f.kind} · ${f.path} — ${f.says}\n`);
}
process.exitCode = 1;
