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
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { parseStateNote } from "../engine/notes.ts";

const here = dirname(fileURLToPath(import.meta.url));
// tests/ sits in project/deliverable/, the trace in project/spec/trace/.
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
