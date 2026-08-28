// CHECKING THE IMPLEMENTATION ALSO CHECKS THE DESIGN AGAINST ITS INPUT (owner).
//
// EVERY OTHER CHECK READS DOWNWARD. Requirement to function, function to
// candidate, design to code — each hop compares itself to the hop above it. A
// design that quietly stopped answering its own requirement passes all of them.
//
// THE TRACE SWEEP IS THE OTHER DIRECTION. It asks whether the CODE realizes the
// DESIGN. Nothing asked whether the DESIGN still answers the INPUT.
import { strict as assert } from "node:assert";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { type RigorMatrixRow, readRigorMatrix } from "../engine/rigor-matrix.ts";

// THE REAL MATRIX, not a fixture. The question is what THIS project's gate
// demands, and a crafted row would answer about the fixture instead.
const REPO = fileURLToPath(new URL("../..", import.meta.url));

function rowNamed(name: string): RigorMatrixRow {
  const row = readRigorMatrix(REPO).rows.find((r: RigorMatrixRow) => r.name === name);
  assert.notEqual(row, undefined, `the matrix carries no row named ${name}`);
  return row as RigorMatrixRow;
}

describe("the implementation gate asks whether the design still answers its input", { concurrency: true }, () => {
  test("the gate carries the field", () => {
    const field = rowNamed("gate-implementation").evidence_form.find((f) => f.name === "design_holds");

    assert.notEqual(field, undefined, "gate-implementation has no design_holds field");
    assert.equal(field?.template, "choice-with-rationale", "a verdict, with the argument beside it");
    assert.deepEqual(field?.options, ["holds", "drifted"], "and the two answers are the two answers");
  });

  // A VERDICT WITH NO QUOTE IS `not answered` (contract rule 5), and this is
  // exactly the kind of claim that reads as diligence while saying nothing.
  test("the field asks for both sides quoted", () => {
    const said = rowNamed("gate-implementation").evidence_form.find((f) => f.name === "design_holds")?.description ?? "";

    assert.match(said, /design OUTPUT against the design INPUT/, "it says which direction it reads");
    assert.match(said, /Quote the requirement and the design section/, "and that a claim carries its evidence");
  });

  // NAMING A GAP DOES NOT CLOSE IT. The gate that recommended a pass over four
  // capabilities it had just listed is the reason this is written down.
  test("drift is a finding rather than a disclosure", () => {
    const row = rowNamed("gate-implementation");
    const said = row.evidence_form.find((f) => f.name === "design_holds")?.description ?? "";

    assert.match(said, /a finding here, never a note for later/);
    assert.match(row.guidance, /DRIFT IS A FINDING, NOT A DISCLOSURE/, "and the guidance says the same");
    assert.match(row.guidance, /THE DRIFT CHECK RUNS IN THE OTHER DIRECTION FROM THE SWEEP/, "against the trace's own sweep");
  });
});
