// THE LAW IS SWEPT, NOT ONLY TRIGGERED.
//
// The design-coverage law is corpus-wide in what it reads and state-local in
// what fires it: stateform-problems.ts asks it only when a walk stands on a
// specify-build or a trace-design state. Every other test of it mints a fresh
// synthetic root, so the battery proved the law WORKED and never once asked
// whether the real corpus PASSED it.
//
// What that costs is measured, and the reasoning is in
// dsp-the-goal-binds-the-walk.md#the-law-is-swept-not-only-triggered.
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { designCoverageProblems } from "../engine/stateform-problems.ts";
import { loadTrace } from "../engine/trace.ts";

const REPO_ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("every element and interface in the real corpus is realized by a design spec", () => {
  const problems = designCoverageProblems(loadTrace(REPO_ROOT));
  assert.deepEqual(
    problems,
    [],
    [
      "the design below the architectural line is specified BEFORE the build, and this sweep is what",
      "makes that true of the corpus rather than only of whichever walk next reaches specify-build.",
      "",
      "A crossing minted today and left uncovered used to surface states later, on somebody else's",
      "iteration, as a wall of names they did not write. Fix it where it was minted:",
      "name the id under `realizes:` on the design spec that actually details it.",
      "",
      "A LINK IS A CONTRIBUTION. Do not file an id somewhere to look covered.",
    ].join("\n"),
  );
});
