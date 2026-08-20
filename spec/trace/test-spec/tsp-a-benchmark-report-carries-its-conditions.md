---
minted_in: i37-training-iterations-a-disposable-iterati
id: tsp-a-benchmark-report-carries-its-conditions
type: "[[test-spec]]"
statement: "A benchmark report is refused unless it carries every condition of its run, and it says both where the run was told to stop and where it actually ended."
method: "test"
verifies:
  - req-a-benchmark-report-carries-the-conditions-of-its-run
  - req-a-run-that-stopped-early-says-where-it-stopped
files:
  - "tests/benchmark-run.test.ts"
---

## Scope

WHAT A REPORT MUST CARRY BEFORE IT IS ALLOWED TO EXIST. Eight conditions and the
two stop fields.

- the iteration, the rewind commit, the change size
- the rigor matrix hash, the se version
- the harness, the model, the reasoning effort
- the stop point the run was GIVEN
- the state the run actually ENDED in

WHAT IS DELIBERATELY OUT. Whether the recorded values are TRUE. A report saying
it ran on the wrong model is a different failure and no test at this level can
catch it.

## Approach

DESIGN METHOD: one case per omitted field, because the requirement is a refusal
and a refusal is only proved one missing field at a time. A single case passing
a complete report proves nothing about the guard.

LEVEL: component.

DEPTH: medium for the mechanism, HIGH for one field, and the asymmetry is
deliberate.

THE RIGOR MATRIX HASH IS THE FIELD THAT MATTERS AND THE ONE THAT IS KNOWN
BROKEN. `raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost` was
probed FALSE on 2026-08-20: `rigorMatrixContentHash` hashes
`rigor_matrix/rows/*.md` and nothing else, so guidance, form templates, item
templates, method cards and the engine all change walk cost without moving it.

A REPORT THAT STAMPS THAT HASH ALONE CLAIMS MORE THAN IT KNOWS. This spec
therefore asserts what the stamp COVERS, not merely that it is present, so the
day the stamp becomes a set the test says so rather than passing unchanged.

## Steps

- a report carrying all ten fields records
- a report omitting any one of the eight conditions is refused, one case per
  field, and the refusal names the missing field
- the stop point given and the state ended in are both recorded, and are
  recorded separately even when they are equal
- a run that reached the end records the two as equal rather than omitting one
- a run stopped early records the state it actually ended in, not the one it
  was aiming at
- the conditions stamp names every directory it covers, so a change to the
  covered set fails here rather than silently widening what the report claims
