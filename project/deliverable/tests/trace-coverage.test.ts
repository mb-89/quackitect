// THE TRACE IS CHECKED BOTH WAYS, OVER THE WHOLE TRACE (owner ruling
// 2026-08-06).
//
// A REGISTER BELONGS TO ONE ITERATION. A requirement written in an earlier
// iteration is not in this one's register and never will be. So register
// membership is not the property worth checking, and a row missing from a
// register is not a defect.
//
// WHAT MATTERS IS THE CONNECTION, in both directions:
//
// - every use case is refined by at least one requirement, and
// - every requirement connects to at least one use case.
//
// The register field's `covers: use-case` check runs both directions over the
// rows it LISTS. A requirement node that no register names is invisible to
// it — a hole that grows with every iteration that runs. These tests read the
// trace FOLDERS instead, so a node is checked because it exists rather than
// because somebody remembered to list it.
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
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

// A GREEN OVER AN EMPTY CORPUS IS NOT A GREEN. Both checks below pass
// trivially if the folders read as empty — a wrong path, a moved tree, a
// parser that returns nothing. This is the red behind their green.
test("the trace corpus is actually being read", () => {
  assert.ok(nodesIn("requirement").length > 100, `expected the real register — found ${nodesIn("requirement").length} requirements`);
  assert.ok(nodesIn("use-case").length > 10, `expected the real use-case set — found ${nodesIn("use-case").length} use cases`);
  assert.ok(
    nodesIn("requirement").filter((r) => r.refines.length > 0).length > 100,
    "expected refines edges to parse — a parser returning none makes both checks vacuous",
  );
});

test("every requirement connects to at least one use case", () => {
  const useCases = new Set(nodesIn("use-case").map((n) => n.id));
  const orphans: string[] = [];
  const dangling: string[] = [];
  for (const r of nodesIn("requirement")) {
    if (r.refines.length === 0) {
      orphans.push(r.id);
      continue;
    }
    for (const uc of r.refines) if (!useCases.has(uc)) dangling.push(`${r.id} -> ${uc}`);
  }
  assert.deepEqual(orphans, [], "a requirement refining nothing hangs off the trace and answers to no pass");
  assert.deepEqual(dangling, [], "a refines edge must land on a use case that exists");
});

test("every use case is refined by at least one requirement", () => {
  const refined = new Set(nodesIn("requirement").flatMap((r) => r.refines));
  const bare = nodesIn("use-case")
    .map((n) => n.id)
    .filter((id) => !refined.has(id));
  assert.deepEqual(bare, [], "a use case no requirement refines is a step nobody specified");
});
