// A BOUND TABLE IS NOT A DASH-LED LIST — the reference check's three
// assumptions, pinned.
//
// WHAT THIS FILE IS FOR. The reference check was written for a list of
// `- <id>` lines and later pointed at tables the ENGINE builds itself. Every
// assumption it makes about a line holds for a list and fails for a register:
//
//   - the leading cells name artifacts — a header's first cell is a TYPE
//   - two leading cells are references — a node table's later cells are that
//     node's own frontmatter, written back rather than resolved
//   - an empty field is the author's silence — a bound table's rows are not
//     the author's to choose
//
// ALL THREE BLOCKED A STATE OUTRIGHT before they were fixed, and none of them
// had a case. They are the machinery that decides whether a claim stands, so
// an unpinned change here is the least visible kind there is.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fieldProblems } from "../engine/stateform-problems.ts";
import { refsInRows, type TraceNode } from "../engine/trace.ts";

// ONLY THE EDITOR, THE LINE SHAPE AND `resolves` ARE READ here, and
// TemplateMeta carries more. Casting through unknown says that plainly rather
// than filling keys nothing looks at.
const NODE_TABLE = {
  editor: "node-table",
  line_pattern: "^\\| .+ \\|",
  line_help: "one row per node; the first cell is the node",
  resolves: "artifact",
} as unknown as Parameters<typeof fieldProblems>[1];

const args = (of: string, items: string[], columns: string[]): Parameters<typeof fieldProblems>[2] =>
  ({ of, items, columns, covers: "", writes: "" }) as unknown as Parameters<typeof fieldProblems>[2];

const node = (id: string, type: string): TraceNode => ({ id, type, statement: "", refines: [] }) as TraceNode;

test("a table's header names columns, never nodes", () => {
  const table = ["| test-spec | method | verifies |", "| --- | --- | --- |", "| [[tsp-one]] | test | req-one |"].join("\n");
  assert.deepEqual(refsInRows(table, 1), ["tsp-one"], "the header's first cell is a type name, not an id");
});

test("a row with no rule under it is read, because only a header has one", () => {
  const table = ["| [[tsp-one]] | test |", "| [[tsp-two]] | test |"].join("\n");
  assert.deepEqual(refsInRows(table, 1), ["tsp-one", "tsp-two"], "two data rows, two references");
});

test("a node table resolves its first cell only, because the rest is written back", () => {
  // A design spec's second column carries ELEMENT ids. Reading them as
  // references of the field's own type reported twenty mistyped edges that
  // were never edges at all.
  const table = ["| design-spec | realizes | files |", "| --- | --- | --- |", "| [[dsp-one]] | el-walk-engine | engine/a.ts |"].join("\n");
  const problems = fieldProblems("design_specs", NODE_TABLE, args("design-spec", ["dsp-one"], ["realizes", "files"]), table, [
    node("dsp-one", "design-spec"),
  ]);
  assert.deepEqual(problems, [], `a written cell is not an artifact to resolve — got:\n${problems.join("\n")}`);
});

test("a bound table over an empty source is an answer, not a blank", () => {
  // The rows come from a live source. An author with no rows has no line to
  // write, so demanding one saying `none` demands a claim nobody can make.
  const problems = fieldProblems(
    "promotions",
    NODE_TABLE,
    args("experiment", [], ["promote", "chunk"]),
    "| experiment | promote | chunk |\n| --- | --- | --- |",
    [],
  );
  assert.deepEqual(problems, [], `an empty register is a result — got:\n${problems.join("\n")}`);
});

test("a bound table that DOES have rows still refuses a reference resolving to nothing", () => {
  // The relaxation above must not become a hole: an empty source is an answer,
  // a dangling row is still a defect.
  const table = ["| test-spec | method |", "| --- | --- |", "| [[tsp-ghost]] | test |"].join("\n");
  const problems = fieldProblems("checks", NODE_TABLE, args("test-spec", ["tsp-ghost"], ["method"]), table, []);
  assert.ok(problems.length > 0, "a row naming no node is still named");
});
