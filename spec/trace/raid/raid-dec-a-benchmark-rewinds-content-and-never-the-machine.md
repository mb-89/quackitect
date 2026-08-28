---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-dec-a-benchmark-rewinds-content-and-never-the-machine
type: "[[raid]]"
kind: decision
statement: A benchmark run exports the content subtree at the rewind commit. The deliverable is never checked out at an old commit, so the engine measured is always the current one.
owner: the owner
trigger: any change to what counts as content, or the first time a benchmark needs a past engine to reproduce a result
status: decided
impact: The whole experiment is whether a weaker model on an improved machine matches a stronger model on the old one. Rewinding the machine with the content would measure the machine as it was, which is the opposite of the question.
breaks_how_badly: fatal
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine
  - "owner ruling 2026-08-19: the engine that works of a rewound tree is the current engine"
  - "probe 2026-08-19: git archive of spec at 5f85977f^ produced 1149 files, 0 mentioning i33"
  - raid-asm-a-throwaway-tree-at-an-old-commit-can-run-the-engine
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

- The rewind operates on `spec` and the corpus. Never on `deliverable`.
- No benchmark result is ever comparable to one taken under a different engine unless both stamp the se version, which the report requirement already demands.
- A rewound run walks TODAY's rigor column over yesterday's work. Anyone reading a report must read the matrix hash beside it.

## Corrected by measurement, 2026-08-19

THE RULING SAID CONTENT RATHER THAN MACHINE and did not say where the line
falls. `exp-does-the-current-engine-run-against-a-rewound-tree` found it by
failing.

A WHOLE-TREE REWIND DOES NOT BOOT:

    MachineCompileError: main: canvas node n-boot: boot.canvas declares no
    priority in its frontmatter

The engine reads `machines/`, `guidance/` and the rigor matrix out of the ROOT
it is handed, not out of its own folder. Old drawings predate a field the
current compiler requires.

SO THE REWIND IS A THREE-WAY SPLIT, and only the middle term was named before
the spike ran.

- REWOUND: `spec`. The records, the corpus, the trace. The work.
- CURRENT: `deliverable` AND `guidance`. The method.
- BOUNDED: the git history, which ends at the rewind commit.

`guidance` IS MACHINE. That is the word this decision was missing, and
a build written against the original wording would have died on a compile
error at the first benchmark run.
