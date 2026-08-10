// THE CONVERGENCE IS ARITHMETIC, proved on a small synthetic set: the axes
// come off the cuts section, the runs off the scores, and a sign matrix can
// disagree with a plain-sum ranking — which is the method, not a bug.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { axesFromCuts, pughView, sensitivityView } from "../engine/pugh.ts";

const grade = (id: string): string => (id === "req-a" ? "fatal" : "crippling");

const CUTS = [
  "1. [[req-a]]",
  "2. [[req-b]] [cut: identical by construction]",
  "3. [[req-c]]",
  "4. [[req-d]] [moved: reads as crippling] [cutoff]",
  "5. [[req-e]]",
].join("\n");

const row = (cand: string, axis: string, score: number): string => `| [[${cand}]] | [[${axis}]] | ${score} | anchor | |`;
const SCORES = [
  "| candidate | axis | score | anchor | prior_art |",
  "| --- | --- | --- | --- | --- |",
  row("cand-x", "req-a", 4),
  row("cand-x", "req-c", 3),
  row("cand-x", "req-d", 2),
  row("cand-y", "req-a", 3),
  row("cand-y", "req-c", 3),
  row("cand-y", "req-d", 4),
  row("cand-z", "req-a", 1),
  row("cand-z", "req-c", 2),
  row("cand-z", "req-d", 2),
].join("\n");

test("the axes come off the cuts: struck rows out, rows past the cutoff out, grades carried", () => {
  const { axes, problems } = axesFromCuts(CUTS, grade);
  assert.deepEqual(
    axes.map((a) => a.id),
    ["req-a", "req-c", "req-d"],
  );
  assert.equal(axes[0].grade, "fatal");
  assert.deepEqual(problems, []);
});

test("the convergence runs to a stable winner, and signs may disagree with plain sums", () => {
  const pv = pughView(SCORES, CUTS, grade);
  // cand-y wins on plain sums (10 to 9); the sign matrix ties it with the
  // datum, and a tie does not unseat. That is Pugh discarding magnitude.
  assert.equal(pv.winner, "cand-x");
  assert.equal(pv.stable, true);
  assert.equal(pv.runs.length, 1);
  assert.equal(pv.runs[0].datum, "cand-x");
  assert.equal(pv.runs[0].totals["cand-y"], 0);
  assert.equal(pv.runs[0].totals["cand-z"], -2);
  assert.deepEqual(pv.problems, []);
});

test("sensitivity names each rival's deficit and its one-point swing cells", () => {
  const sv = sensitivityView(SCORES, CUTS, grade);
  assert.equal(sv.winner, "cand-x");
  assert.equal(sv.rivals[0].id, "cand-y");
  assert.equal(sv.rivals[0].deficit, 0);
  assert.deepEqual(
    sv.rivals[0].swings.map((s) => s.axis),
    ["req-a", "req-c"],
  );
  assert.equal(sv.rivals[1].id, "cand-z");
  assert.equal(sv.rivals[1].deficit, 2);
});

test("fewer than two candidates is a named problem, never a winner", () => {
  const one = [row("cand-x", "req-a", 4)].join("\n");
  const pv = pughView(one, CUTS, grade);
  assert.equal(pv.winner, "");
  assert.equal(pv.runs.length, 0);
  assert.ok(pv.problems.some((p) => p.includes("fewer than two")));
});
