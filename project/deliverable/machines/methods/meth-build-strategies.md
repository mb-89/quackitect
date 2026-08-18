---
kind: method
statement: Know the build strategies and let them shape the order. They inform the plan; nothing enforces a pick.
---

## Situation

Guidance for M7 specify-build. A chunk plan without shape is a pile.

The strategies below are LENSES on the same plan, never exclusive
choices — a good plan usually shows two at once (owner ruling
2026-08-11). Record in the plan which lenses shaped the order, so a
reviewer can judge the order and not only the pieces.

## Spine first (walking skeleton)

- The thinnest end-to-end slice that exercises every seam, then flesh
  in increments.
- Buys integration confidence earliest. The seams are where the
  surprises live.
- Use when the parts are clear but their fit is not.
- Misleads when one part carries the real risk: a skeleton around an
  infeasible core is scaffolding around nothing.

## Risk first (breakthrough early — make it run, then make it right)

- The riskiest or most-doubted piece first, while the budget to react
  still exists.
- Its everyday form is the owner's own ruling: a crude working whole
  before any polish. Both faces put feedback before finish, and they
  are one lens, not two.
- Buys certainty about feasibility.
- Misleads when risk is spread evenly: then the spine finds it
  cheaper.

## Parallel flow (integrated flow management)

- Split the build into LOTS — strands of chunks that run in parallel.
- Shape the dependencies so a later lot leans on ideally ONE earlier
  lot. A lot waiting on three others is a bottleneck drawn in advance.
- Parallel is not isolated. Strands exchange inputs and updates at
  NAMED points — a dependency edge in the drawing, never a hallway
  assumption.
- The dependency edges ARE the strands: chunks with no path between
  them fan out to parallel builders; a chain builds in series. Draw
  the edges first and the parallelism falls out.
- The check before seeding: per edge, ask what actually FLOWS across
  it. An edge carrying nothing is dropped; a missing flow is a
  forgotten edge.
- Buys wall-clock time and builder fan-out.
- Misleads when the work is one deep chain — forcing width onto a
  chain only adds seams.

## The checklist against the order

- Let the classic integration strategies check it: bottom-up,
  top-down, feature-driven, big-bang. Big-bang is almost always the
  wrong answer; incremental, risk-driven sequencing is the best
  practice.
- The drivers to weigh: functionality dependencies, technical risk,
  component availability, release pressure.
- Promoted spike output enters as pre-verified starting chunks
  ([[meth-expedition-promotion]]) — an order that ignores what already
  exists re-buys it.

## Sources

- SyA Architecting (walking skeleton) and Testing Tactics (integration
  strategies), owner-mapped digest @ai/sya_kb.
- Integrated flow management: the SyA business lecture —
  @ai/sya_kb/kb/content/Integrated Flow management.md (split
  integration into lots, later lots ideally dependent on one earlier
  lot, parallelize). The owner recalls the course taught it on an
  airport build; the slide itself is in SyA_Business.pdf, not
  text-searchable — primary not seen.
