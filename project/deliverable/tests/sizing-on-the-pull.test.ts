// THE ANSWER RIDES THE PULL — tsp-the-lane-publishes-a-strength-and-starts-nothing,
// against req-the-machine-names-a-driver-and-starts-nothing, and the
// publishing half of req-an-unmatched-rung-names-itself-and-publishes-no-driver.
//
// THE PULL IS THE ONE CALL THE AGENT MAKES, so the statement reaches a reader
// without a second channel and without a protocol. The lane says and does not
// do: publishing is where the machine's part ends.
import { strict as assert } from "node:assert";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { CHANGE_COLUMNS, compileColumn, matrixDir, readRigorMatrix } from "../engine/rigor-matrix.ts";
import { Session } from "../engine/session.ts";
import { type Difficulty, difficultyOf, publish, RUNGS } from "../engine/sizing.ts";
import { freshRoot, laneSources, pullTo } from "./helpers.ts";

function rateEverything(root: string): void {
  const matrix = readRigorMatrix(root);
  for (const row of matrix.rows) {
    if (row.runs !== undefined) continue;
    const abs = join(matrixDir(root), "rows", row.file);
    for (const col of CHANGE_COLUMNS) {
      if (matrix.cells.get(row.name)?.get(col)?.applies === "none") continue;
      const text = readFileSync(abs, "utf8");
      const end = text.indexOf("\n---", 3);
      writeFileSync(abs, `${text.slice(0, end)}\n${col}_complexity: C3/R1${text.slice(end)}`, "utf8");
    }
  }
}

/** WHAT A PULL WOULD CARRY, assembled the way the pull assembles it.
 *
 *  THE END-TO-END WALK IS NOT ASSERTED HERE AND THAT IS SAID RATHER THAN
 *  HIDDEN. Only an iteration's states carry a rating — a difficulty is
 *  declared on a matrix CELL, and the boot machine's states are not matrix
 *  rows — so seeing the field on a live pull needs a bound iteration walked to
 *  a rated step. That is a demonstration, and `run-demos` is where it belongs.
 *
 *  WHAT THIS FILE HOLDS INSTEAD is every half the pull depends on: that a
 *  rated step produces the envelope, that an unrated one produces nothing, and
 *  that a pull with no rating anywhere is unchanged from before this existed. */
function envelopeFor(root: string): { rung?: string; pair?: Difficulty }[] {
  const decl = compileColumn(readRigorMatrix(root), "major");
  return decl.states
    .filter((s) => (s.kind === "work" || s.kind === "gate") && s.submachine === undefined)
    .map((s) => publish(difficultyOf(s)));
}

test("every rated step produces a rung and the pair it came from", () => {
  const root = freshRoot();
  rateEverything(root);
  const sent = envelopeFor(root);
  assert.ok(sent.length > 0, "the column must compile some steps for this to mean anything");
  for (const needs of sent) {
    assert.deepEqual(needs.pair, { judgement: "C3", reading: "R1" }, "the input goes out with the decision");
    assert.ok(RUNGS.includes(needs.rung as (typeof RUNGS)[number]), `${needs.rung} is not in the published vocabulary`);
    assert.ok(!String(needs.rung).includes("-"), "the block names a rung and never a model");
  }
});

test("an unrated step produces nothing rather than a guess", () => {
  assert.throws(() => envelopeFor(freshRoot()), "a fallback to whatever is running is indistinguishable from a working lookup");
});

test("a pull standing where nothing is rated is unchanged from before this existed", async () => {
  const s = new Session(freshRoot());
  s.setAutonomy(1);
  await pullTo(s, "idle");
  const body = (await s.pull()) as Record<string, unknown>;
  assert.equal(body.needs, undefined, "no rating, no statement — and no refusal either");
  assert.ok("where" in body, "the walk carries on exactly as it did");
});

// THE ABSENCE OVER ALL PATHS is what tsp-the-lane-publishes-a-strength-and-starts-nothing
// asserts, and a test can only sample paths. This case holds the one thing a
// test CAN hold: that the sizing element's own source starts nothing. The
// inspection over every path is the spec's, at verification.
test("nothing on the sizing path starts a process", () => {
  const src = readFileSync(new URL("../engine/sizing.ts", import.meta.url), "utf8");
  // THE CHECK IS ON CALLS AND IMPORTS, not on words. The file's own comments
  // say the lane does not spawn, and a substring search for "spawn" flagged
  // exactly the sentence promising it never happens.
  for (const forbidden of ["node:child_process", "spawnSync(", "spawn(", "execFileSync(", "execSync("]) {
    assert.ok(!src.includes(forbidden), `engine/sizing.ts carries ${forbidden} — the lane does not start processes`);
  }
  assert.ok(laneSources().length > 0, "the lane must have sources for the inspection to mean anything");
});
