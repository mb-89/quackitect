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
probe: "unprobed \u2014 nothing has yet stood a tree at a rewind commit and tried to boot it."
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