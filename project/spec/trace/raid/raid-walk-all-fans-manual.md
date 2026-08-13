---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: raid-walk-all-fans-manual
type: "[[raid]]"
kind: issue
statement: Covering a fan took one manual pass per branch, because the route found the nearest path rather than every path the gate collects.
owner: the engine bundle
trigger: when the next multi-branch milestone walks
status: mitigated
breaks_how_badly: corrosive
how_likely: conceivable
impact: The walker chose branches by guess. On 2026-08-07 that sent a walk down an already-finished branch while the unfinished one sat untouched, and the gate ahead would have refused on a feeder nobody had been sent to.
source_refs:
  - engine/route.ts computeRoute
  - engine/machine.ts claimFeeders
---

The gate law and the collection busbar both stood. The ROUTE did not know
about either — it was breadth-first shortest path, which answers "what is
nearest" when the question was "what is needed".

MITIGATED 2026-08-07, not closed. The route now walks the fan-in backwards
from the target, takes every claim-bearing input of a collection bar as a
prerequisite, drops the ones already standing, and aims at the first one with
nothing unmet behind it. The walk that found this issue was then re-run and
went straight to the single owed branch, past six standing states.

WHY IT STAYS OPEN AS MITIGATED rather than closed: the OR case is still
undrawn and unenforced. note-9f08e4937a7b holds that half — the one-of-many
bar, its dashed candidates, and the survivor resolving solid. Until that
lands, a fan where one branch would suffice is treated as though every branch
were required, which is safe but wasteful.

The trigger stands so the next multi-branch milestone re-checks it in anger.
