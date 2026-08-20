---
id: raid-ar-trees-never-mix
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-trees-never-mix at risk — the response hinges on el-engine-delta.
owner: the adjudicator
trigger: any change to el-engine-delta, or to the scenario on req-trees-never-mix
status: open
impact: the delta resolves two levels, record then trunk, and a vehicle overlay layered on the open engine is a third level nothing on the chart composes.
breaks_how_badly: fatal
how_likely: conceivable
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - el-engine-delta
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-engine-delta; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.

## Re-pointed and put back, i34 2026-08-16

This entry was briefly re-pointed at req-a-write-lands-where-it-is-meant, on the
belief that i34 had retired req-trees-never-mix. It had — in error. The
requirement is restored and this entry points where it always did.

THE ENTRY WAS THE EVIDENCE THAT THE DELETION WAS WRONG, and it is worth saying
why, because the same mistake is easy to make again. Its impact line is about
OVERLAYS: "a vehicle overlay layered on the open engine is a third level nothing
on the chart composes." i34 deleted record worktrees. Overlays were never in
scope, and the row it retired was the overlay one.

TWO THINGS WERE BOTH CALLED "TREE". That is the whole error, and re-pointing the
risk carried it one step further instead of catching it. The requirement's own
node records the rest.
