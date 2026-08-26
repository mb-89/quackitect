---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs
type: "[[raid]]"
kind: issue
statement: The fatal live-read requirement forbids pinning the complexity anywhere, but the harm it was written against is confined to the demand ledger, and the ledger is a narrow structure that a cell value cannot reach.
owner: the walking agent
trigger: any candidate that carries the complexity on the compiled machine, which is every candidate riding the cell
looked: 2026-08-20
closed: 2026-08-20
status: closed
impact: As written the requirement rules out the cheapest implementation on the chart — three edits to code that already runs — and rules it out for a reason that does not apply to it. A must-priority constraint that over-reaches costs the design its best candidate at gate-candidates, silently, because a constraint is checked and not argued.
breaks_how_badly: degraded
how_likely: expected
probe: "MEASURED AT probe 4 AND CORRECTED AT gate-candidates, both 2026-08-20. THE FIRST READING WAS WRONG IN A WAY THAT MAKES THIS ISSUE NARROWER AND THE REQUIREMENT BETTER FOUNDED. It said a cell value reaches nothing in the demand ledger. One already does. engine/iterations.ts:294 builds each demand as three fields — an `applies`, an `evidence` and a `shape` — and the first of them IS the cell value for that column. engine/iterations.ts:356 reopens a record when the applies RANK rises, before shape or evidence is compared at :360 and :361. So the ledger admits a cell value today, it is ranked, and a rise in it reopens standing claims. WHAT SURVIVES, AND IT IS THE POINT: `demandsFor` at :289 builds the record from three NAMED things, so a fourth cell key carrying a complexity is ignored by construction and moves no demand. The conclusion holds; the reason given for it did not. AND THE CORRECTION CUTS BOTH WAYS: because the ledger already carries one cell value, admitting a second is a one-line edit somebody could make without seeing the reopen consequence, which is a sharper version of the fear the requirement was written from than the requirement itself states. engine/iterations.ts:329 shapeOf serialises four keys — depends_on sorted, busbar, seeds, runs — and a complexity key reaches none of those four. It reaches the compiled StateDecl, by the same path engine/rigor-matrix.ts:612 already uses for the cell's prose, and the compiled machine is written to the pin at iterations.ts:236. So the value would be PINNED, which the statement forbade WHEN THIS WAS WRITTEN and no longer does — the requirement was restated to its own harm on 2026-08-20 and the pin is legal — and would NOT move a demand, which is the only harm the requirement records."
probed: 2026-08-20
source_refs:
  - i38-the-machine-sizes-its-own-driver-every-s
  - probe 4 at find_by_probing, 2026-08-20
weighs_with: none
weighs_against: none
---

## Closed at gate-architecture, 2026-08-20

THE REQUIREMENT WAS RESTATED AND THIS ISSUE IS WHAT IT WAS RESTATED TO.
`req-the-complexity-value-is-read-live-and-never-pinned` now reads: keep a
step's complexity out of every record's demand ledger, so that a complexity
changing reopens no standing claim. The source and the timing are gone. The
fatal grade and the named test stand.

WHAT CLOSING IT COSTS NOBODY: the cheapest implementation on the chart is
eligible again. Two of the four candidates pick
`opt-the-complexity-rides-the-cell-the-compiled-state-already-carries`, and
under the old wording both were excluded on a clause this node had already
shown does not apply to them.

THE PROBE'S OWN CORRECTION SURVIVES INTO THE NEW WORDING and is the reason the
demand is still fatal. The ledger already admits one cell value —
engine/iterations.ts:294 makes `applies` the first of three demand fields and
:356 reopens a record when its rank rises — so admitting a second is a one-line
edit somebody could make without seeing the consequence. That is a sharper fear
than the old text stated, and the restated demand names it directly.

HOW LONG IT SAT OPEN, recorded because that is the reusable part. Minted at M4,
accurate from the day it was written, quoted approvingly in an option file, and
unacted on through four states and two gates. It was closed by the must-check
finally being run, not by anybody re-reading it.

## The statement is wider than its own justification

TWO CLAUSES, ONE REASON. The statement says the value shall be read at the moment
it is needed AND shall never enter a demand ledger. Only the second clause is
argued for anywhere — breaks_if_removed is entirely about demands moving and
claims reopening, and the detail section verifies that the demand builder and `shapeOf`
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

THIS IS FOR gate-candidates TO RULE ON, not for the finder to fix. A finder that
amends the requirement it is searching under has stopped searching.
