---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine
type: "[[raid]]"
kind: assumption
statement: "A tree standing at an old commit can run the engine that was current then, so a benchmark walk gets past boot at all."
owner: the maintainer of the machine
trigger: the first benchmark run that reaches its first pull
status: open
impact: "The run cannot start, and the failure looks like a broken benchmark rather than an incompatible checkout."
breaks_how_badly: fatal
how_likely: plausible
probe: "HOLDS BY OWNER RULING 2026-08-19 — the CURRENT engine runs over a rewound tree. The owner: \"The engine that works of a rewound tree is the current engine. I think it is clear.\" So the rewind is CONTENT only, and the deliverable is never checked out at an old commit."
probed: 2026-08-19
source_refs:
  - fn-the-benchmark-run.stand-a-throwaway-tree-and-bind-the-run
  - raid-dec-an-archived-iteration-is-the-benchmark-and-nothing-is-authored
weighs_with: none
weighs_against: none
---

## Probe

THE QUESTION IS WHICH ENGINE RUNS. Two answers are possible and they are
different products.

- THE OLD ENGINE, checked out with the tree. Then the benchmark measures the
  machine as it was, which is the wrong direction entirely — the point is to
  measure the CURRENT machine against old work.
- THE CURRENT ENGINE, over an old content tree. Then the machine being measured
  is the one we want, and the tree only supplies the work.

THE SECOND IS ALMOST CERTAINLY WHAT IS WANTED and nothing in the iteration has
said so yet. This assumption exists to force that ruling before M4 designs
around the wrong one.

WHY IT IS FATAL. If the old engine runs, every number describes a machine
nobody is improving.

HOW TO CHECK IT. Stand a tree at a rewind commit and try to boot. `node_modules`
is gitignored, `engines.node` may differ, and the machines folder is content
that moved. One spike answers it.

## Ruled rather than spiked, 2026-08-19

THE OWNER SETTLED IT DIRECTLY. The current engine runs over a rewound tree.

WHAT THAT CHANGES, and it makes the mechanism smaller.

- THE REWIND IS A CONTENT OPERATION. Records, corpus and trace go back. The
  deliverable does not.
- NO OLD `node_modules`, NO OLD `engines.node`. The environment question that
  came with this assumption dissolves with it.
- THE MACHINE MEASURED IS THE ONE BEING IMPROVED, which is what the whole
  iteration is for.

WHAT STILL NEEDS CARE, and it is a new seam rather than a leftover. The
current engine reads a rigor matrix, and the matrix is method rather than
content. A rewound run therefore walks TODAY's column over YESTERDAY's work.
That is intended — the machine is the axis — and it is why a benchmark report
stamps the matrix hash.
