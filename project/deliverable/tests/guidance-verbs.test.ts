// GUIDANCE THAT NAMES A VERB NOBODY BUILT COSTS THE READER THEIR CALLS.
//
// Measured twice on one walk driven by a smaller model. The
// method card carried a heading reading "se_package builds the artifact" for
// a verb that has never existed, and the prompt layer taught a reading proof
// the engine had already replaced. A capable model reads around both. A
// smaller one calls what the page says and is stuck, because a verb that is
// not registered has no typed refusal and therefore no remedy.
//
// THIS IS THE CHEAP HALF OF THAT PROBLEM. Whether a sentence is true is a
// judgment; whether the verb it names exists is a set membership test.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { GUIDANCE, guidanceDocs } from "./helpers.ts";

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));

/** Every `se_` name the tool surface actually registers. */
function registered(): Set<string> {
  const dir = join(ROOT, "project/deliverable/engine");
  const out = new Set<string>();
  for (const f of readdirSync(dir).filter((n) => n.startsWith("tools") && n.endsWith(".ts"))) {
    for (const m of readFileSync(join(dir, f), "utf8").matchAll(/name:\s*"(se_[a-z_]+)"/g)) out.add(m[1]);
  }
  return out;
}

/** Names that LOOK like verbs and are not, each with why it is exempt. */
const NOT_A_VERB: Record<string, string> = {
  se_test_verdict: "a call-log record kind, written by the battery when it ends",
  se_update: "the narration op's internal tool name on the log line, never called directly",
  se_version:
    "a field name, not a verb — calllog.ts stamps it on every record and a benchmark report carries it forward as one of its conditions",
};

/** Every page an agent is served as guidance. The method layer, the state
 *  notes the walk hands over one at a time, and everything under machines/
 *  that a state, a form or a method card puts in front of a reader.
 *
 *  THE MACHINES TREE WAS THE HOLE. This check swept `guidance/` and the state
 *  notes and stopped there, while 172 further pages — the rigor-matrix rows a
 *  walk reads at every milestone, the method cards, the form templates —
 *  went unswept. Six dead paths and a retired clause were sitting in them.
 *
 *  DERIVED, never named. */
function guidancePages(): string[] {
  const out = [...guidanceDocs()];
  const walk = (rel: string): void => {
    for (const e of readdirSync(join(ROOT, rel), { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${rel}/${e.name}`);
      else if (e.name.endsWith(".md")) out.push(`${rel}/${e.name}`);
    }
  };
  walk("project/deliverable/machines");
  return out;
}

/** A REFERENCE INTO ANOTHER TREE IS NOT A DEAD PATH. The corpus cites v1 at
 *  `ref main` in a dozen places, and those files are real where they live. A
 *  line naming a ref is saying so, and is left alone. */
function reachesAnotherTree(text: string, at: number): boolean {
  const from = text.lastIndexOf("\n", at) + 1;
  const to = text.indexOf("\n", at);
  const line = text.slice(from, to === -1 ? text.length : to);
  return /\bref[: ]\s*(main|v2)\b|\bat ref\b|\bv[12]'s\b/.test(line);
}

/** THE ONE WAY TO NAME A VERB THAT IS NOT THERE: mark its section. The
 *  marker is the reader's warning and this check's exemption at once, so a
 *  section cannot carry one without carrying the other. */
const MARKER = "NOT BUILT YET";

function marked(text: string, at: number): boolean {
  const before = text.slice(0, at);
  const start = Math.max(before.lastIndexOf("\n#"), 0);
  const after = text.indexOf("\n#", at);
  return text.slice(start, after === -1 ? text.length : after).includes(MARKER);
}

test("every lane verb the guidance names is a verb the lane registers", () => {
  const real = registered();
  assert.ok(real.size > 20, "the tool surface did not parse — the check would pass vacuously");
  const bad: string[] = [];
  for (const p of guidancePages()) {
    const text = readFileSync(join(ROOT, p), "utf8");
    for (const m of text.matchAll(/\bse_[a-z_]+/g)) {
      const v = m[0];
      if (real.has(v) || NOT_A_VERB[v] !== undefined) continue;
      if (marked(text, m.index)) continue;
      bad.push(`${p} names ${v}`);
    }
  }
  assert.deepEqual(
    [...new Set(bad)],
    [],
    "guidance names a lane verb that does not exist — build it, rename it, or mark the section NOT BUILT YET and say what to do instead",
  );
});

// A PATH THAT DOES NOT RESOLVE AS WRITTEN COSTS THE SAME CALLS.
//
// The lane's one path rule is that everything is root-relative, and the
// guidance broke it 22 times. Measured on the same walk: the contract named
// "machines/stopat.md", the reader passed it to se_file_read verbatim, and
// two refusals and a glob went by before the file was found at
// project/deliverable/machines/stopat.md.
//
// THE SHAPE THAT BITES IS THE ONE THAT ALMOST WORKS. A path resolving under
// some other prefix reads as correct to a writer standing in that folder, and
// is unusable to a reader who only has the root.
const PATH_LIKE = /(?:^|[\s`([])([A-Za-z0-9_][A-Za-z0-9_./-]*\/[A-Za-z0-9_./-]*\.(?:md|ts|mjs|json|canvas|jsonl|base))/g;

/** Written by the machinery at run time, so absence proves nothing. */
const RUNTIME = /^(\.se\/|node_modules\/)/;

test("every file path the guidance names resolves from the project root", () => {
  const bad: string[] = [];
  for (const p of guidancePages()) {
    const text = readFileSync(join(ROOT, p), "utf8");
    for (const m of text.matchAll(PATH_LIKE)) {
      const ref = m[1];
      if (RUNTIME.test(ref) || existsSync(join(ROOT, ref))) continue;
      if (marked(text, m.index) || reachesAnotherTree(text, m.index)) continue;
      const near = ["project", "project/deliverable", "project/guidance", "project/deliverable/machines"].find((pre) =>
        existsSync(join(ROOT, pre, ref)),
      );
      bad.push(near === undefined ? `${p} names ${ref}, which is nowhere` : `${p} names ${ref} — write ${near}/${ref}`);
    }
  }
  assert.deepEqual([...new Set(bad)], [], "the lane resolves every path from the project root, and these do not");
});

// A REFUSAL POINTS AT ITS OWN SECTION, so a clause the page does not carry is
// a dead pointer handed over at the exact moment the reader is stuck. Every
// typed rejection ships the refusals page and the clause number in `guidance`,
// and following it is the documented way to recover in one turn.
//
// THE OTHER DIRECTION IS THE SAME BUG MIRRORED: a page describing a refusal
// the engine cannot raise teaches a rule nobody can trip. Both are exempt only
// by saying RETIRED, the same shape the NOT BUILT YET marker uses.
test("every refusal clause is documented, and every documented clause exists", () => {
  const engine = new Set(
    [...readFileSync(join(ROOT, "project/deliverable/engine/errors.ts"), "utf8").matchAll(/"(SE-C-\d+)"/g)].map((m) => m[1]),
  );
  assert.ok(engine.size > 20, "errors.ts did not parse — the check would pass vacuously");
  const page = readFileSync(join(ROOT, GUIDANCE.refusalsPage), "utf8");
  const documented = new Map<string, number>();
  for (const m of page.matchAll(/SE-C-\d+/g)) if (!documented.has(m[0])) documented.set(m[0], m.index);

  const undocumented = [...engine].filter((c) => !documented.has(c)).sort();
  assert.deepEqual(undocumented, [], "the engine raises a clause the refusals page does not carry, and its own remedy points there");

  const retired = (at: number): boolean => {
    const start = Math.max(page.lastIndexOf("\n#", at), 0);
    const after = page.indexOf("\n#", at);
    return page.slice(start, after === -1 ? page.length : after).includes("RETIRED");
  };
  const phantom = [...documented]
    .filter(([c, at]) => !engine.has(c) && !retired(at))
    .map(([c]) => c)
    .sort();
  assert.deepEqual(phantom, [], "the refusals page describes a clause the engine cannot raise — delete it, or mark the section RETIRED");
});
