---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs
type: "[[raid]]"
kind: issue
statement: "The fatal live-read requirement forbids pinning the complexity anywhere, but the harm it was written against is confined to the demand ledger, and the ledger is a narrow structure that a cell value cannot reach."
owner: the walking agent
trigger: "any candidate that carries the complexity on the compiled machine, which is every candidate riding the cell"
status: open
impact: "As written the requirement rules out the cheapest implementation on the chart — three edits to code that already runs — and rules it out for a reason that does not apply to it. A must-priority constraint that over-reaches costs the design its best candidate at gate-design, silently, because a constraint is checked and not argued."
breaks_how_badly: degraded
how_likely: expected
probe: "MEASURED AT probe 4, find_by_probing, by reading the code the requirement is about. The harm named in breaks_if_removed is demand movement: engine/iterations.ts:329 shapeOf serialises exactly four keys — depends_on sorted, busbar, seeds, runs — and :350 reopens a record where two shapes differ. A value on RigorMatrixCell reaches none of those four. It reaches the compiled StateDecl, by the same path engine/rigor-matrix.ts:612 already uses for the cell's prose, and the compiled machine is written to the pin at iterations.ts:236. So the value would be PINNED, which the statement forbids, and would NOT move a demand, which is the only harm the requirement records."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - "probe 4 at find_by_probing, 2026-08-20"
weighs_with: none
weighs_against: none
---

## The statement is wider than its own justification

TWO CLAUSES, ONE REASON. The statement says the value shall be read at the moment
it is needed AND shall never enter a demand ledger. Only the second clause is
argued for anywhere — breaks_if_removed is entirely about demands moving and
claims reopening, and the detail section verifies that `demandOf` and `shapeOf`
do not admit a new key today.

THE FIRST CLAUSE CAME ALONG FOR THE RIDE. Nothing in the record says why the value
must be live. It reads as a strengthening — if pinning demands is dangerous,
pinning anything must be worse — and that inference is what a probe is for.

WHAT A PIN ACTUALLY COSTS HERE. A complexity pinned into the compiled machine
goes stale when the matrix is edited mid-record. The consequence is that a walk
sizes its steps by the policy in force when it was blessed rather than the policy
in force now. That is a real cost and it is arguably the RIGHT behaviour: the same
argument that makes a record's step shapes stable makes its difficulties stable,
and re-reading live means an edit to one matrix row changes what every open record
is about to spend.

## What would settle it

NAME THE HARM, THEN SIZE THE CLAUSE TO IT. Either the first clause acquires its own
breaks_if_removed — a stated harm from staleness — or it is struck and the
requirement says what it means: the complexity shall never enter a record's demand
ledger. The second is what the risk node behind it actually describes.

THIS IS FOR gate-design TO RULE ON, not for the finder to fix. A finder that
amends the requirement it is searching under has stopped searching.
