---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-a-benchmark-rewinds-content-and-never-the-machine
type: "[[raid]]"
kind: decision
statement: "A benchmark run exports the content subtree at the rewind commit. The deliverable is never checked out at an old commit, so the engine measured is always the current one."
owner: the owner
trigger: "any change to what counts as content, or the first time a benchmark needs a past engine to reproduce a result"
status: decided
impact: "The whole experiment is whether a weaker model on an improved machine matches a stronger model on the old one. Rewinding the machine with the content would measure the machine as it was, which is the opposite of the question."
breaks_how_badly: fatal
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - "owner ruling 2026-08-19: the engine that works of a rewound tree is the current engine"
  - "probe 2026-08-19: git archive of project/spec at 5f85977f^ produced 1149 files, 0 mentioning i33"
  - "raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine"
---

## What it settles

Four milestones of design said a run stands a tree at the rewind commit. None
said which ENGINE runs over it, and the assumption was opened fatal at
identify-assumptions.

## Why the current engine

THE MACHINE IS THE AXIS OF THE EXPERIMENT. A run measures how the machine as
it stands today handles work that was really done once.

## What it makes smaller

The environment questions dissolve with it. No old node_modules, no old
engines.node pin, no second install.

## The seam it leaves

The current engine reads TODAY's rigor matrix, so a rewound run walks today's
column over yesterday's work. That is intended, and it is why a benchmark
report stamps the matrix hash.

## Rejected options

- CHECK THE WHOLE REPOSITORY OUT at the rewind commit. Rejected: it measures the machine as it was, which inverts the experiment. It also drags an old `engines.node` pin and an absent `node_modules`.
- REWIND NOTHING and let the agent re-walk against today's tree. Rejected: the answers are all present, so the run measures search-and-paste rather than walking.
- PIN AN OLD RIGOR MATRIX with the current engine. Rejected: it makes the machine a constant when the machine is the axis.

## Consequences

- The rewind operates on `project/spec` and the corpus. Never on `project/deliverable`.
- No benchmark result is ever comparable to one taken under a different engine unless both stamp the se version, which the report requirement already demands.
- A rewound run walks TODAY's rigor column over yesterday's work. Anyone reading a report must read the matrix hash beside it.
