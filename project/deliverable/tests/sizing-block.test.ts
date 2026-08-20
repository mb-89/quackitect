// A STEP IS SIZED FROM ITS OWN ROWS — tsp-a-step-is-sized-from-its-own-rows,
// against req-every-matrix-row-declares-its-complexity,
// req-a-milestone-takes-the-maximum-complexity-over-its-rows and
// req-an-unmatched-rung-names-itself-and-publishes-no-driver.
//
// THE BLOCK READS A STEP AND NEVER THE MATRIX. if-engine-delta-to-sizing and
// if-method-compiler-to-sizing both hand it a compiled machine, so the sizing
// cases go through compileColumn rather than through a row lookup.
//
// THE IMPORT IS DYNAMIC ON PURPOSE. engine/sizing.ts is written at
// build-steps. A top-level import would take the whole file down before any
// case ran, and observe-red refuses a run with zero cases — an instrument
// failure must never read as a red.
import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { CHANGE_COLUMNS, type ChangeColumn, compileColumn, matrixDir, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { freshRoot } from "./helpers.ts";

const SIZE: ChangeColumn = "major";

interface Difficulty {
  judgement: string;
  reading: string;
}
interface Sizing {
  difficultyOf(step: unknown): Difficulty | undefined;
  sizeUnit(steps: unknown[]): { difficulty: Difficulty; spread: { step: string; difficulty: Difficulty }[] };
  rungFor(d: Difficulty): { rung?: string; unmatched?: Difficulty };
}

async function sizing(): Promise<Sizing> {
  return (await import("../engine/sizing.ts")) as unknown as Sizing;
}

function setComplexity(abs: string, judgement: string, reading: string, col: string = SIZE): void {
  const text = readFileSync(abs, "utf8");
  const end = text.indexOf("\n---", 3);
  assert.ok(end > 0, "the row must have frontmatter to edit");
  writeFileSync(abs, `${text.slice(0, end)}\n${col}_complexity: ${judgement}/${reading}${text.slice(end)}`, "utf8");
}

/** THE LINE THAT TURNS THE LOAD-TIME REFUSAL ON. The engine reads the matrix
 *  folder's own README for it, so a fixture that wants the refusal has to say
 *  the thing that makes it binding — which is the point of putting it there. */
function declareRated(root: string): void {
  const abs = join(matrixDir(root), "README.md");
  writeFileSync(abs, `${readFileSync(abs, "utf8")}\n\nEVERY ACTIVE CELL CARRIES A COMPLEXITY.\n`, "utf8");
}

function appliedRows(root: string): { name: string; file: string; runs?: string }[] {
  const matrix = readRigorMatrix(root);
  return matrix.rows
    .filter((r) => matrix.cells.get(r.name)?.get(SIZE)?.applies !== "none")
    .map((r) => ({ name: r.name, file: r.file, runs: r.runs }));
}

/** RATE EVERY CELL THAT OWES ONE, IN EVERY COLUMN. Rating only `major` leaves
 *  the other three columns unrated, and the load-time refusal then fires on
 *  whichever row it reaches first — which is a true refusal about the wrong
 *  cell, and it made this file's own case pass for the wrong reason once. */
function rateEverything(root: string, skip?: { name: string; column: string }): void {
  const matrix = readRigorMatrix(root);
  for (const row of matrix.rows) {
    if (row.runs !== undefined) continue;
    for (const col of CHANGE_COLUMNS) {
      if (matrix.cells.get(row.name)?.get(col)?.applies === "none") continue;
      if (skip !== undefined && skip.name === row.name && skip.column === col) continue;
      setComplexity(join(matrixDir(root), "rows", row.file), "C2", "R2", col);
    }
  }
}

test("every applied row yields a difficulty", async () => {
  const root = freshRoot();
  rateEverything(root);
  const decl = compileColumn(readRigorMatrix(root), SIZE);
  const { difficultyOf } = await sizing();
  // START AND END ARE MECHANICAL. Every machine has them, nothing
  // machine-specific belongs in them, and no matrix row declares them — so
  // they carry no cell and owe no rating. A check that demanded one would be
  // asking the walk's own scaffolding how hard it is.
  // AND A STATE THAT DESCENDS IS NOT SIZED EITHER. It routes into a
  // sub-machine and the work happens in the states below, which is the whole
  // of exp-two-hands-rating-the-same-six-cells' promotion. Asking one how hard
  // it is would be asking a doorway how far the room is.
  const walked = decl.states.filter((s) => (s.kind === "work" || s.kind === "gate") && s.submachine === undefined);
  assert.ok(walked.length > 0, "the column must compile some steps for this to mean anything");
  const missing = walked
    .filter((s) => {
      try {
        difficultyOf(s);
        return false;
      } catch {
        return true;
      }
    })
    .map((s) => s.id);
  assert.deepEqual(missing, [], "a step the walk will run must know how hard it is");
});

test("a row that applies and declares nothing is a loud refusal", () => {
  const root = freshRoot();
  const victim = appliedRows(root).find((r) => r.runs === undefined);
  assert.ok(victim !== undefined, "the column must apply at least one non-seeding row");
  rateEverything(root, { name: victim.name, column: SIZE });
  declareRated(root);
  assert.throws(
    () => readRigorMatrix(root),
    (e: Error) => e.message.includes(victim.name) && e.message.includes(SIZE),
    "the refusal names the row and the column — a default or a silent skip fails this step",
  );
});

test("a row that does not apply in a column owes nothing there", () => {
  const root = freshRoot();
  const matrix = readRigorMatrix(root);
  // ANY column that excludes any row. Naming `major` here would have made
  // this case vacuous, because the live matrix applies every row at `major`.
  const excluded = matrix.rows.flatMap((r) =>
    CHANGE_COLUMNS.filter((c) => matrix.cells.get(r.name)?.get(c)?.applies === "none").map((c) => ({ row: r.name, column: c })),
  );
  assert.ok(excluded.length > 0, "some row must be excluded somewhere for this to mean anything");
  rateEverything(root);
  declareRated(root);
  assert.doesNotThrow(
    () => readRigorMatrix(root),
    `a row not walked in a column has no work to size there — ${excluded.length} such cells stand unrated`,
  );
  const after = readRigorMatrix(root);
  assert.equal(
    after.cells.get(excluded[0].row)?.get(excluded[0].column)?.difficulty,
    undefined,
    "and it carries no difficulty either, rather than a default nobody chose",
  );
});

test("an unrated matrix still loads, and refuses at the point of use instead", async () => {
  const root = freshRoot();
  const matrix = readRigorMatrix(root);
  const bare = matrix.rows.find((r) => matrix.cells.get(r.name)?.get(SIZE)?.applies !== "none" && r.seeds === undefined);
  assert.ok(bare !== undefined, "the column must apply at least one non-seeding row");
  assert.equal(matrix.cells.get(bare.name)?.get(SIZE)?.difficulty, undefined, "nothing is rated yet, and that is not a load failure");
  const { difficultyOf } = await sizing();
  assert.throws(() => difficultyOf({ id: bare.name }), "nothing proceeds without a complexity — the refusal moves, it does not disappear");
});

test("an unreadable complexity refuses whether the matrix is rated or not", () => {
  const root = freshRoot();
  const victim = appliedRows(root).find((r) => r.runs === undefined);
  assert.ok(victim !== undefined, "the column must apply at least one non-seeding row");
  const abs = join(matrixDir(root), "rows", victim.file);
  const text = readFileSync(abs, "utf8");
  const end = text.indexOf("\n---", 3);
  writeFileSync(abs, `${text.slice(0, end)}\n${SIZE}_complexity: sideways${text.slice(end)}`, "utf8");
  assert.throws(
    () => readRigorMatrix(root),
    (e: Error) => e.message.includes("C0") && e.message.includes("R0"),
    "a wrong value is always wrong, and the refusal names both vocabularies",
  );
});

test("a row that runs a sub-machine may not carry a difficulty", () => {
  const root = freshRoot();
  const runner = appliedRows(root).find((r) => r.runs !== undefined);
  assert.ok(runner !== undefined, "the matrix must carry at least one row that descends");
  setComplexity(join(matrixDir(root), "rows", runner.file), "C2", "R2");
  assert.throws(
    () => readRigorMatrix(root),
    (e: Error) => e.message.includes(runner.name),
    "a placeholder for work that happens in the sub-machine below has no difficulty of its own — exp-two-hands-rating-the-same-six-cells",
  );
});

test("a row that SEEDS a sub-machine is real work and owes a difficulty", () => {
  const root = freshRoot();
  const matrix = readRigorMatrix(root);
  const seeder = matrix.rows.find((r) => r.seeds !== undefined && r.runs === undefined);
  assert.ok(seeder !== undefined, "the matrix must carry a row that seeds without descending");
  rateEverything(root);
  declareRated(root);
  assert.doesNotThrow(
    () => readRigorMatrix(root),
    `${seeder.name} authors a drawing and is walked like any other step — seeding is not descending`,
  );
});

test("a unit is no weaker than its hardest step, and the spread rides along", async () => {
  const { sizeUnit } = await sizing();
  const steps = [
    { id: "easy", complexity: { judgement: "C1", reading: "R0" } },
    { id: "hard", complexity: { judgement: "C4", reading: "R1" } },
    { id: "middling", complexity: { judgement: "C2", reading: "R3" } },
  ];
  const out = sizeUnit(steps);
  assert.deepEqual(out.difficulty, { judgement: "C4", reading: "R3" }, "the unit takes the maximum on each figure");
  assert.deepEqual(
    out.spread.map((s) => s.step).sort(),
    ["easy", "hard", "middling"],
    "how far each step sits below the unit answer stays readable",
  );
});

test("an unmatched pair returns a value naming itself and no driver", async () => {
  const { rungFor } = await sizing();
  const out = rungFor({ judgement: "C9", reading: "R9" });
  assert.equal(out.rung, undefined, "no driver is published for a pair the ladder does not place");
  assert.deepEqual(out.unmatched, { judgement: "C9", reading: "R9" }, "the result carries what it could not place");
});

test("an unmatched pair never falls back", async () => {
  const { rungFor } = await sizing();
  const placed = rungFor({ judgement: "C2", reading: "R2" });
  const out = rungFor({ judgement: "C9", reading: "R9" });
  assert.notEqual(out.rung, placed.rung, "a silent fallback is indistinguishable from a working lookup");
  assert.equal(out.rung, undefined, "and it is not the strongest entry either");
});

test("the compile carries the cell's difficulty onto the step", () => {
  const root = freshRoot();
  rateEverything(root);
  const matrix = readRigorMatrix(root);
  const decl = compileColumn(matrix, SIZE);
  const walked = decl.states.filter((s) => s.kind === "work" || s.kind === "gate");
  assert.ok(walked.length > 0, "the column must compile some steps for this to mean anything");
  for (const s of walked) {
    const declared: Difficulty | undefined = matrix.cells.get(s.id)?.get(SIZE)?.difficulty;
    if (declared === undefined) continue;
    assert.deepEqual(s.complexity, declared, `${s.id} lost its difficulty between the cell and the step`);
  }
});

test("a step whose cell declared none carries none, rather than a default", () => {
  const root = freshRoot();
  const decl = compileColumn(readRigorMatrix(root), SIZE);
  const withOne = decl.states.filter((s) => s.complexity !== undefined);
  assert.deepEqual(withOne, [], "nothing is rated in this fixture, so nothing may claim a rating");
});
