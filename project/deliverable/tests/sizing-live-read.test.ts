// A COMPLEXITY NEVER ENTERS A DEMAND LEDGER — req-the-complexity-value-is-read-live-and-never-pinned,
// graded fatal, and tsp-a-complexity-never-enters-a-demand-ledger.
//
// WHAT THIS FILE IS FOR. Three records stand open with pinned demands. A
// complexity leaking into a demand digest does not throw — it surfaces weeks
// later as a cascade of reopened claims with no obvious cause.
//
// THE FIRST CASE IS THE NEGATIVE CONTROL AND IT IS DELIBERATE. The guard cases
// below pass vacuously while no cell can carry a complexity at all: nothing
// changes, so no digest moves. The exposure case is what makes them mean
// something, and it is the one that is red before the build.
import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { demandsFor } from "../engine/iterations.ts";
import { type ChangeColumn, matrixDir, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { freshRoot } from "./helpers.ts";

const SIZE: ChangeColumn = "major";

/** A row that applies at `major`, chosen by reading the matrix rather than by
 *  naming one — a hardcoded row name goes stale the first time the matrix is
 *  re-drawn, and the test then measures nothing while staying green. */
function anAppliedRow(root: string): { name: string; file: string } {
  const matrix = readRigorMatrix(root);
  const row = matrix.rows.find((r) => matrix.cells.get(r.name)?.get(SIZE)?.applies !== "none" && r.seeds === undefined);
  assert.ok(row !== undefined, "the major column must apply at least one non-seeding row");
  return { name: row.name, file: row.file };
}

/** Write a complexity onto a row's frontmatter for the change-size column it
 *  applies in. ONE SCALAR, `<column>_complexity: C3/R1`, for the same reason
 *  `applies` and `<column>_note` are scalars: a Bases table edits a cell
 *  inline and cannot edit a nested map. */
function setComplexity(root: string, file: string, judgement: string, reading: string): void {
  const abs = join(matrixDir(root), "rows", file);
  const text = readFileSync(abs, "utf8");
  const end = text.indexOf("\n---", 3);
  assert.ok(end > 0, "the row must have frontmatter to edit");
  writeFileSync(abs, `${text.slice(0, end)}\n${SIZE}_complexity: ${judgement}/${reading}${text.slice(end)}`, "utf8");
}

test("a declared complexity is visible on the loaded cell", () => {
  const root = freshRoot();
  const { name, file } = anAppliedRow(root);
  setComplexity(root, file, "C3", "R1");
  const cell = readRigorMatrix(root).cells.get(name)?.get(SIZE);
  assert.ok(cell !== undefined, "the cell must load");
  assert.deepEqual(
    cell.difficulty,
    { judgement: "C3", reading: "R1" },
    "the loader exposes what the cell declares — without this the guards below measure nothing",
  );
});

test("changing a complexity moves no demand digest", () => {
  const root = freshRoot();
  const { name, file } = anAppliedRow(root);
  setComplexity(root, file, "C1", "R1");
  const before = demandsFor(readRigorMatrix(root), SIZE)[name];
  const abs = join(matrixDir(root), "rows", file);
  writeFileSync(abs, readFileSync(abs, "utf8").replace(`${SIZE}_complexity: C1/R1`, `${SIZE}_complexity: C4/R1`), "utf8");
  const after = demandsFor(readRigorMatrix(root), SIZE)[name];
  assert.deepEqual(after, before, "the demand a step asks for is untouched by how hard the step is");
});

test("changing a complexity moves no step shape", () => {
  const root = freshRoot();
  const { name, file } = anAppliedRow(root);
  setComplexity(root, file, "C1", "R1");
  const before = demandsFor(readRigorMatrix(root), SIZE)[name].shape;
  const abs = join(matrixDir(root), "rows", file);
  writeFileSync(abs, readFileSync(abs, "utf8").replace(`${SIZE}_complexity: C1/R1`, `${SIZE}_complexity: C1/R4`), "utf8");
  assert.equal(demandsFor(readRigorMatrix(root), SIZE)[name].shape, before, "the shape is the topology, and a difficulty is not topology");
});

test("a change the ledger IS about still moves the digest", () => {
  const root = freshRoot();
  const { name, file } = anAppliedRow(root);
  const before = demandsFor(readRigorMatrix(root), SIZE)[name].applies;
  const abs = join(matrixDir(root), "rows", file);
  const text = readFileSync(abs, "utf8");
  const swapped = before === "full" ? "tailored" : "full";
  writeFileSync(abs, text.replace(new RegExp(`^${SIZE}: ${before}$`, "m"), `${SIZE}: ${swapped}`), "utf8");
  assert.notEqual(
    demandsFor(readRigorMatrix(root), SIZE)[name].applies,
    before,
    "without this the three cases above pass on a digest that never moves at all",
  );
});
