// THE TRACE IS CHECKED BOTH WAYS, AT EVERY LAYER, OVER THE WHOLE TRACE
// (owner ruling 2026-08-06).
//
// A REGISTER BELONGS TO ONE ITERATION. A node written in an earlier iteration
// is not in this iteration's register and never will be. So register
// membership is not the property worth checking, and a row absent from one is
// not a defect.
//
// WHAT MATTERS IS THE CONNECTION, both ways, for every adjacent pair:
//
// - every parent is refined by at least one child, and
// - every child connects to at least one parent.
//
// The evidence forms' `covers:` checks run both directions over the rows a
// form LISTS. A node that no register names is invisible to them, and that
// hole grows with every iteration that runs. These tests read the trace
// FOLDERS, so a node is checked because it exists rather than because
// somebody remembered to list it.
//
// VALUE PROPS ARE THE TOP and are not checked upward. They hang off the
// vision, which is a document rather than a trace node.
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseStateNote } from "../engine/notes.ts";
import { laneSource } from "./helpers.ts";

const here = dirname(fileURLToPath(import.meta.url));
// tests/ sits in deliverable/, the trace in spec/trace/.
const TRACE = join(here, "..", "..", "spec", "trace");

interface Node {
  id: string;
  refines: string[];
}

function nodesIn(kind: string): Node[] {
  return readdirSync(join(TRACE, kind))
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const fm = parseStateNote(readFileSync(join(TRACE, kind, f), "utf8")).frontmatter as Record<string, unknown>;
      const refines = Array.isArray(fm.refines) ? fm.refines.filter((x): x is string => typeof x === "string") : [];
      return { id: typeof fm.id === "string" ? fm.id : f.replace(/\.md$/, ""), refines };
    });
}

const LAYERS = ["value-prop", "story", "use-case", "requirement"] as const;

/** The chain, child first. Each pair is checked in both directions. */
const CHAIN = [
  { child: "story", parent: "value-prop" },
  { child: "use-case", parent: "story" },
  { child: "requirement", parent: "use-case" },
] as const;

/** Every id the trace holds, whatever its layer. */
function knownIds(): Set<string> {
  return new Set(LAYERS.flatMap((k) => nodesIn(k).map((n) => n.id)));
}

// A GREEN OVER AN EMPTY CORPUS IS NOT A GREEN. Every check below passes
// trivially if the folders read as empty — a wrong path, a moved tree, a
// parser that returns nothing. This is the red behind their green.
test("the trace corpus is actually being read", () => {
  for (const kind of LAYERS) assert.ok(nodesIn(kind).length > 0, `no ${kind} nodes found — the path or the parser is wrong`);
  assert.ok(nodesIn("requirement").length > 100, `expected the real register — found ${nodesIn("requirement").length}`);
  for (const { child } of CHAIN) {
    assert.ok(
      nodesIn(child).some((n) => n.refines.length > 0),
      `no ${child} parsed a refines edge — every check on this layer would be vacuous`,
    );
  }
});

test("every refines edge lands on a node that exists", () => {
  const ids = knownIds();
  const dangling: string[] = [];
  for (const kind of LAYERS) {
    for (const n of nodesIn(kind)) for (const r of n.refines) if (!ids.has(r)) dangling.push(`${n.id} -> ${r}`);
  }
  assert.deepEqual(dangling, [], "a refines edge naming nothing is a broken trace");
});

// THE LIVE OFFER, WALKED MECHANICALLY (req-reachable-capability-is-traced).
//
// The row splits three ways. The doors are drawn from the machine, and the
// panel's actions are code in no single shape, so both are still walked by
// hand. The lane verbs are not like them: they are declared in one file, in
// one shape, and a regex finds every one.
//
// The row was first committed 2026-08-09. Four days later the i3 tester
// counted 14 of 35 verbs named nowhere in the trace. That is the miss this
// check makes impossible.
//
// WHAT THIS FILE CHECKS, AND WHAT IT DOES NOT. The row makes three demands
// of every verb. Two of them are mechanical below: named in the trace at
// all, and named in the use-case layer. The third — at least one requirement
// demanding it — is not checked here, and stays analysis.
function registeredVerbs(): string[] {
  const src = laneSource();
  return [...new Set([...src.matchAll(/^\s+name: "(se_[a-z_]+)",$/gm)].map((m) => m[1]))].sort();
}

/** Every word one layer of the trace says, or the whole of it. */
function traceText(sub = "."): string {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((e) => {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) return walk(full);
      return e.endsWith(".md") ? [readFileSync(full, "utf8")] : [];
    });
  return walk(join(TRACE, sub)).join("\n");
}

function unnamedIn(sub: string): string[] {
  const text = traceText(sub);
  return registeredVerbs().filter((v) => !new RegExp(`\\b${v}\\b`).test(text));
}

describe("the live offer against the trace", () => {
  // A GREEN OVER AN EMPTY READ IS NOT A GREEN. Both reads are guarded, and
  // the verb list is guarded against its own shape: the enumerator matches a
  // literal declaration line, so a verb registered differently would go
  // silently missing and take its own check with it.
  test("the verb list and the trace are actually being read", () => {
    // 35 at i3, 36 when se_help merged in from the other machine, 34 at i34
    // when se_git_land and se_git_sync went with the second tree they
    // reconciled, and 36 at i16 when the two producing acts became lane verbs.
    // The exact count is the point: a verb arriving or leaving SHOULD break
    // this line once, so somebody confirms the enumerator still sees every one
    // before moving it. Confirmed on 2026-08-18 — the enumerator saw both new
    // verbs and reported them as untraced, which is the check working.
    assert.equal(registeredVerbs().length, 38, "the lane's verb count moved — confirm the enumerator still sees every one");
    assert.ok(traceText().length > 10000, "the trace read as good as empty — the path or the walk is wrong");
    assert.ok(traceText("use-case").length > 10000, "the use-case layer read as good as empty");
  });

  test("every lane verb the engine registers is named in the trace", () => {
    assert.deepEqual(unnamedIn("."), [], "a verb a person can call, that no node in the trace names");
  });

  // req-reachable-capability-is-traced asks for a use case saying what
  // somebody DOES with each capability. Named in a raid or a neighbour note
  // does not satisfy that — those sit off the value-prop-to-requirement
  // chain, so nothing downstream can reach them.
  test("every lane verb is named in a use case, not merely somewhere", () => {
    assert.deepEqual(unnamedIn("use-case"), [], "a verb with no use case saying what somebody does with it");
  });
});

for (const { child, parent } of CHAIN) {
  describe(`${child} refines ${parent}`, () => {
    test(`every ${child} connects to at least one ${parent}`, () => {
      const parents = new Set(nodesIn(parent).map((n) => n.id));
      const orphans = nodesIn(child)
        .filter((c) => !c.refines.some((r) => parents.has(r)))
        .map((c) => c.id);
      assert.deepEqual(orphans, [], `a ${child} refining no ${parent} hangs off the trace`);
    });

    test(`every ${parent} is refined by at least one ${child}`, () => {
      const refined = new Set(nodesIn(child).flatMap((c) => c.refines));
      const bare = nodesIn(parent)
        .map((n) => n.id)
        .filter((id) => !refined.has(id));
      assert.deepEqual(bare, [], `a ${parent} no ${child} refines is a promise nothing shows`);
    });
  });
}
