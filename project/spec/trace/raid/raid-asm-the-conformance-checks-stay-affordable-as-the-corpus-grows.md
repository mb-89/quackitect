---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: raid-asm-the-conformance-checks-stay-affordable-as-the-corpus-grows
type: "[[raid]]"
kind: assumption
statement: The conformance checks stay inside their budgets as the corpus grows, so the write guard keeps refusing at the write and the sweep keeps running at the moments the engine chose.
owner: the driving agent
trigger: any write that feels slow, any sweep past two seconds, or a corpus above three thousand nodes
probe: unprobed by i35, and the empty date is filled rather than the verdict invented. The corpus grew this run by 20 nodes — 5 requirements, 7 functions, 6 flows, 1 story, 1 use case — and the sweep stayed green at 1150 nodes in 410 ms. That is a data point on cost, not a probe of the assumption, which is about growth this iteration did not test.
status: open
probed: 2026-08-17
impact: the guard grows too slow for the write and moves to the sweep, which is a demotion the whole iteration was built to avoid.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - req-a-check-too-slow-for-the-write-moves-to-the-sweep
  - req-a-write-that-breaks-the-corpus-refuses
  - req-a-check-binds-without-engine-code
---

## The assumption

EVERY NUMBER THIS ITERATION RECORDED CAME OFF ONE CORPUS SIZE. The sweep ran
at 327 to 388 milliseconds over roughly 1019 nodes. The write guard was
measured inside the write budget on the same tree.

NOTHING HERE SAYS WHAT EITHER COSTS AT TEN THOUSAND NODES.

## Why it is worth a row rather than a shrug

THE METHOD ALREADY HAS THE ESCAPE HATCH, and that is the danger.
`req-a-check-too-slow-for-the-write-moves-to-the-sweep` says a check that
outgrows the write budget is demoted to the sweep. So a slow check does not
break loudly. It quietly stops being a write-time refusal and becomes a
report somebody reads later.

THAT IS EXACTLY THE FAILURE THIS ITERATION WAS BUILT TO END. The thesis is
that conformance runs at the write, not at a review. A check that drifts into
the sweep has walked the thesis backwards without anybody deciding to.

## Probe

TWO MEASUREMENTS, both cheap.

- Grow a fixture corpus to three thousand nodes and run the sweep. Read the
  wall clock.
- Time one guarded write against that corpus.

WHAT WOULD SETTLE IT: a sweep that scales linearly and a write still inside
its budget. Either number growing faster than the node count is the answer
this row is waiting for.

## Where it was found

THE VALIDATION GATE NAMED IT AND MINTED NOTHING. Its round 2 closed with
"what this gate cannot see: whether the checks stay right as the corpus
grows". That was true and it was prose, so it would have left with the
record.

The release gate's own field asks for assumptions the milestone treats as
true without having established them. This is that, written down.
