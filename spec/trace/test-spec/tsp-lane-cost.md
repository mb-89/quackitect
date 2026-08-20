---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: tsp-lane-cost
type: "[[test-spec]]"
statement: The full battery runs only where the method says, a scoped run answers its caller once, and a deletion names what points at the node — including a mention in prose.
method: test
verifies:
  - req-the-full-battery-runs-where-the-method-says
  - req-a-deletion-names-what-points-at-the-node
files:
  - tests/lanecost.test.ts
---

## Scope

What a lane call costs, in the two places it can be checked mechanically: who
may run the whole suite, and what an act tells you before it lands.

WHAT IS OUT: the pull payload's size and the amend's shape. Both are in this
iteration's scope and both are measured rather than asserted — the pass lines
are calls per state and bytes per answer, and they belong to verification's
measurement rather than to a case here.

## Approach

Component level against a real booted server. Same discipline as
tsp-the-bucket: drive the real verbs, fail on an assertion, never on an import.

THE THIRD CASE IS FAULT-BASED ON PURPOSE. It cites the doomed node in PROSE
only, because that is the half a graph-only implementation would silently skip.

## Steps

- An agent-initiated full battery outside verification is refused, and names
  where it belongs. No arguments IS the battery: engine/tools.ts routes a call
  with no `files` through runBattery, past batteryGate and testGate.
- A scoped run answers its caller without being asked a second time. Measured
  baseline: 494 se_test calls produced 66 verdicts, so about 428 asked only
  whether a job had finished.
- Deleting a node names what points at it, including a mention in prose.

## Why the third case cites in prose rather than in frontmatter

raid-asm-the-trace-graph-holds-every-reference PROBED FALSE IN PART. The trace
graph found i34's frontmatter orphans — two requirements from a deleted
function, one must story from a deleted test-spec — and missed seventeen prose
citations plus three engine comments, because trace-coverage reads frontmatter
edges rather than bodies.

THE GRAPH SEES ROUGHLY A FIFTH OF WHAT A DELETION BREAKS. A warning built on it
alone would report a clean list and be believed, which is worse than no
warning. This case makes that implementation fail.

## The two battery clauses are one demand

raid-dec-blocking-and-the-battery-refusal-ship-together records the ruling and
its rejected options. The refusal alone strands 428 wasted polls. The answer
alone removes the accidental deterrent — a battery currently costs a handoff
plus ten calls of watching, which is part of why five ran rather than fifty —
and leaves the judgment that was already wrong five times in one day.
