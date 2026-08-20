---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: raid-iss-a-requirement-lost-its-only-verifier-when-its-demonstration-was-dropped
type: "[[raid]]"
kind: issue
statement: "Dropping a demonstration left the requirement it verified with no verifier at all, and nothing reported the gap because the coverage check reads live specs only."
owner: the maintainer
trigger: every observe-red and every trace-design, until the row has a verifier again
status: open
impact: "req-a-surface-resolves-to-what-it-shows is carried at every gate on a claim nothing checks. tsp-bound-surface was its only verifier and reads status dropped, so the row now passes coverage by not being looked at rather than by being verified."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - tsp-bound-surface
  - req-a-surface-resolves-to-what-it-shows
  - raid-debt-the-bound-surface-demo-leans-on-two-open-records
weighs_with: none
weighs_against: none
---

## What was observed

FOUND AT i9's observe-red, 2026-08-20, while dealing the non-test checklist.
The item could be neither checked nor owed honestly: there is no procedure left
to watch failing, because the procedure was dropped.

THE DROP WAS RIGHT AND IS NOT IN QUESTION. The owner ruled on 2026-08-17 that
the bound-surface demonstration leaned on two records that were still open, and
the spec carries that ruling in its own body.

WHAT NOBODY DID WAS RE-HOME THE ROW. i9's architecture deck already named this
in its follow-up: "req-a-surface-resolves-to-what-it-shows was verified only by
the demonstration that got dropped. Nothing verifies it now." It was recorded
there as not that debt's to carry, and it has had no home since.

## Why the coverage check did not catch it

THE CHECK READS LIVE SPECS. A dropped spec leaves the corpus's live set, so the
requirement it verified stops being claimed by anything and no rule notices the
subtraction. A row that never had a verifier is caught; a row that loses one is
not.

THAT IS THE PART WORTH FIXING. The gap is not this one requirement, which is a
day's work to re-verify. It is that dropping a spec is a silent subtraction
from coverage.

## What would close it

EITHER a verifier for the row, by whatever method survives the reasons the
demonstration was dropped, OR a recorded decision that the row is retired.
Carrying it unverified at every gate is the one outcome that should not stand.
