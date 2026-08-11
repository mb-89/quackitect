---
kind: method
statement: "Name the order the chunks are built in. The order is a strategy, and it is chosen rather than fallen into."
---

## Situation
Guidance for M7 plan-build. A chunk plan without a strategy is a pile: the strategy is what orders it, and it is chosen, not implied.

## Procedure
- Name ONE primary strategy in the plan:
  - SPINE FIRST (walking skeleton): the thinnest end-to-end slice that exercises every seam, then flesh in increments. Buys integration confidence earliest.
  - BREAKTHROUGH EARLY: the riskiest or most-doubted piece first, while the budget to react still exists. Buys certainty about feasibility.
  - MAKE IT RUN, THEN MAKE IT RIGHT: a crude working whole before any polish (the owner's own ruling: first get it to run, then improve it). Buys feedback on the whole before cost sinks into parts.
- Let the classic integration strategies check the order: bottom-up, top-down, feature-driven, big-bang - big-bang is almost always the wrong answer; incremental, risk-driven sequencing is the best practice.
- The drivers to weigh: functionality dependencies, technical risk, component availability, release pressure.
- Promoted spike output enters as pre-verified starting chunks ([[meth-expedition-promotion]]) - a strategy that ignores what already exists re-buys it.
- Record the strategy WITH the plan so the reviewer can judge the order, not only the pieces.

## Parallel strands (integrated flow management)

The strategy names the ORDER. This names the WIDTH: how much of the plan
can run at once.

- Split the build into LOTS - strands of chunks that can run in parallel.
- Shape the dependencies so a later lot leans on ideally ONE earlier lot.
  A lot waiting on three others is a bottleneck drawn in advance.
- Parallel is not isolated. Strands exchange inputs and updates at NAMED
  points - a dependency edge in the drawing, never a hallway assumption.
- The dependency edges ARE the strands: chunks with no path between them
  fan out to parallel builders; a chain builds in series. Draw the edges
  first, and the parallelism falls out instead of being asserted.
- The check before seeding: for every edge, ask what actually FLOWS across
  it. An edge carrying nothing is dropped; a missing flow is an edge that
  was forgotten.

## Sources

- SyA Architecting (walking skeleton) and Testing Tactics (integration
  strategies), owner-mapped digest @ai/sya_kb.
- Integrated flow management: the SyA business lecture -
  @ai/sya_kb/kb/content/Integrated Flow management.md (split integration
  into lots, later lots ideally dependent on one earlier lot, parallelize).
  The owner recalls the course taught it on an airport build; the slide
  itself is in SyA_Business.pdf, not text-searchable - primary not seen.
