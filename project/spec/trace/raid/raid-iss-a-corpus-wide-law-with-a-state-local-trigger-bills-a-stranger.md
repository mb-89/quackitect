---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-a-corpus-wide-law-with-a-state-local-trigger-bills-a-stranger
type: "[[raid]]"
kind: issue
statement: "A law that reads the whole corpus but fires only at one state accumulates debt nobody is billed for, and then bills whichever iteration next stands there. Twice now that iteration has been i37."
owner: the maintainer of the machine
trigger: any new corpus-wide law added as a state check, or any existing one whose backlog has never been swept
status: open
impact: "An iteration is stopped by a wall of ids it did not mint. The work is real and belongs to somebody else, so it is done badly or filed to look covered - and a link filed to look covered is worse than the gap it hides."
breaks_how_badly: corrosive
how_likely: expected
probe: "MEASURED 2026-08-20 on i37, twice over. Fourteen uncovered crossings named at specify-build, nine of them minted in i9. Seventeen register entries graded at rank-unknowns, none of them i37's."
probed: 2026-08-20
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - raid-iss-a-placeholder-that-runs-a-sub-machine-can-never-be-re-signed
weighs_with: none
weighs_against: none
---

## What happens

THE OWNER ASKED THE RIGHT QUESTION: no iteration should be able to ship
interfaces with no design spec, so how did this happen.

THE ANSWER IS NOT THAT THE LAW IS MISSING. It exists, it is correct, and it
fired exactly as written.

### The law is corpus-wide in scope

`designCoverageProblems` in `engine/stateform-problems.ts` reads every element
and every interface in the trace against every design spec's `realizes:`.
Nothing about it is scoped to one iteration.

### The trigger was state-local

    if (s.id.endsWith("specify-build")) out.push(...specifyBuildLawProblems(...))

That line, and the same coverage half again at trace-design. Nowhere else.

### So the debt was invisible until somebody walked there

THE LAW LANDED AS AN OWNER RULING ON 2026-08-11. Everything already in the
corpus that day became debt, and nothing swept it.

i9 SHIPPED BEFORE THE LAW EXISTED. Nine of its crossings had no design spec and
nothing could have told it so.

### The battery proved the law worked and never asked whether the corpus passed

ELEVEN TEST CASES EXERCISE THIS LAW. Every one mints a fresh synthetic root with
`freshRoot()`.

A LAW TESTED ONLY AGAINST FIXTURES IS A LAW ABOUT FIXTURES. The logic was green
the entire time the corpus was in breach.

## Why it is graded corrosive rather than abrasive

IT WORKS, AND PEOPLE ROUTE AROUND IT EVERY TIME. That is the definition.

THE ROUTE AROUND IS THE DANGEROUS PART. An iteration handed fourteen ids it did
not mint has one cheap way out: file each id under the nearest design spec so
the count goes to zero. The specify-build guidance warns against exactly this —
`A LINK IS A CONTRIBUTION` — and the warning exists because the temptation is
structural.

A FILED LINK IS WORSE THAN THE GAP. The gap is visible. A wrong link reads as
coverage forever.

## The fix, shipped

`tests/design-coverage-sweep.test.ts` runs `designCoverageProblems` over the
REAL trace and demands an empty list. `designCoverageProblems` is exported for
it; it was module-private.

WHAT CHANGES. An uncovered crossing fails the battery on the day it is minted,
in the iteration that minted it, where whoever drew it still knows which design
carries it.

WHY A TEST RATHER THAN A SECOND STATE CHECK. Another state moves the trigger
without removing the shape. The battery runs on every change, which is the
cadence a corpus-wide law actually needs.

## What was done about the fourteen

ALL FOURTEEN WERE COVERED BY HAND, AND EACH WAS CHECKED BEFORE IT WAS FILED.

- Four are i37's own and went onto `dsp-benchmark-binding` and
  `dsp-benchmark-report`, with a section on each spec saying what the crossing
  carries.
- Six cross `el-state-declaration` and went onto `dsp-the-state-declaration`,
  whose own statement is that every consumer is generated from the declaration.
  That is what those six crossings are.
- Four cross `el-entrypoint` and went onto `dsp-unattended-entrypoint`. Three
  are its bring-up steps. The fourth, `if-entrypoint-to-walk-engine`, carries
  the harness profile and the spec said nothing about a profile, so a section
  was written rather than the id filed.

## What is still open

THE SECOND OCCURRENCE OF THIS SHAPE IS NOT FIXED. The register's exit condition
made i37 grade seventeen entries it did not write, recorded as
note-83835912bf27. Same mechanism, different law, and it has no sweep.

THE GENERAL FORM HAS NO CHECK AT ALL. Nothing stops the next corpus-wide law
from landing as a state check with no sweep and no battery test over the real
corpus. The two known instances are fixed one at a time.

## Why this stays OPEN with two of its three instances fixed

THE CLASS IS NOT THE INSTANCE. Two instances have a check now — the
design-coverage sweep and the checklist scoping. Nothing guards the SHAPE.

THE THIRD INSTANCE IS SHIPPED AND NOT LIVE. `claimSpecItems` is scoped, `tsc`
is clean and `tests/checklists-stay-home.test.ts` pins it, but the engine
serving this walk loaded the old code and `se_reload` is not legal at
observe-red. So i37 met its own checklist with twenty `[owed]` lines pointing
here, which is the template working exactly as the 2026-08-13 ruling intended
and is not a discharge.

THE REGISTER GRADING INSTANCE HAS NO FIX AT ALL. note-83835912bf27: the
register's exit condition made this iteration grade seventeen entries it did
not write. Same mechanism, no sweep, undrained for a retro.

WHAT WOULD CLOSE THIS. A check that every live source feeding a per-record form
is scoped to that record. Three have been found by hand — `$promotions` on
2026-08-13, and these two on 2026-08-20 — and each was found by somebody asking
why, never by a check going red.
