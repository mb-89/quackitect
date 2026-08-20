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
import { type ChangeColumn, compileColumn, matrixDir, readRigorMatrix } from "../engine/rigor-matrix.ts";
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

function setComplexity(abs: string, judgement: string, reading: string): void {
  const text = readFileSync(abs, "utf8");
  const end = text.indexOf("\n---", 3);
  assert.ok(end > 0, "the row must have frontmatter to edit");
  writeFileSync(
    abs,
    `${text.slice(0, end)}\ncomplexity:\n  ${SIZE}:\n    judgement: ${judgement}\n    reading: ${reading}${text.slice(end)}`,
    "utf8",
  );
}

function appliedRows(root: string): { name: string; file: string; seeds?: string }[] {
  const matrix = readRigorMatrix(root);
  return matrix.rows
    .filter((r) => matrix.cells.get(r.name)?.get(SIZE)?.applies !== "none")
    .map((r) => ({ name: r.name, file: r.file, seeds: r.seeds }));
}

function rateEverything(root: string, skip?: string): void {
  for (const r of appliedRows(root)) {
    if (r.seeds !== undefined || r.name === skip) continue;
    setComplexity(join(matrixDir(root), "rows", r.file), "C2", "R2");
  }
}

test("every applied row yields a difficulty", async () => {
  const root = freshRoot();
  rateEverything(root);
  const decl = compileColumn(readRigorMatrix(root), SIZE);
  const { difficultyOf } = await sizing();
  const missing = decl.states.filter((s) => difficultyOf(s) === undefined).map((s) => s.id);
  assert.deepEqual(missing, [], "a step the walk will run must know how hard it is");
});

test("a row that applies and declares nothing is a loud refusal", () => {
  const root = freshRoot();
  const victim = appliedRows(root).find((r) => r.seeds === undefined);
  assert.ok(victim !== undefined, "the column must apply at least one non-seeding row");
  rateEverything(root, victim.name);
  assert.throws(
    () => readRigorMatrix(root),
    (e: Error) => e.message.includes(victim.name) && e.message.includes(SIZE),
    "the refusal names the row and the column — a default or a silent skip fails this step",
  );
});

test("a row that does not apply in a column owes nothing there", () => {
  const root = freshRoot();
  const matrix = readRigorMatrix(root);
  const absent = matrix.rows.find((r) => matrix.cells.get(r.name)?.get(SIZE)?.applies === "none");
  assert.ok(absent !== undefined, "the major column must exclude at least one row for this to mean anything");
  rateEverything(root);
  assert.doesNotThrow(() => readRigorMatrix(root), "a row not walked here has no work to size");
});

test("a row that seeds a sub-machine may not carry a difficulty", () => {
  const root = freshRoot();
  const seeder = appliedRows(root).find((r) => r.seeds !== undefined);
  assert.ok(seeder !== undefined, "the matrix must carry at least one seeding row");
  setComplexity(join(matrixDir(root), "rows", seeder.file), "C2", "R2");
  assert.throws(
    () => readRigorMatrix(root),
    (e: Error) => e.message.includes(seeder.name),
    "a placeholder for work that happens elsewhere has no difficulty of its own — exp-two-hands-rating-the-same-six-cells",
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
