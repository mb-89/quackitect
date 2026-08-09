---
steps:
  - id: derived-house
    statement: "compose cand-derived-house — the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: signalled-line
    statement: "compose cand-signalled-line — the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: living-form
    statement: "compose cand-living-form — the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: thin-worktree
    statement: "compose cand-thin-worktree — the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: pushed-step
    statement: "compose cand-pushed-step — the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
---

# The candidate drawing

One compose state per line drawn on the chart at build_chart. Five lines were
drawn, so there are five states.

They are independent. None composes better for having seen another, and
composing in sequence would invite the second one to argue with the first.
So they all hang off start and the join waits for every one.

## What this file used to say, and why it was wrong

It carried an explicit `none` reading "i1 stands in the design-input
milestones, which are matrix rows, not chunk candidates". That sentence is
about M7 build chunks. This drawing is the M4 candidate set, which is a
different thing that happens to share the file shape.

The false `none` let the walk pass run-candidates without ceremony. The
matrix row M4_25_run-candidates says in plain words that build-chart authors
this file, one compose state per line on the chart. It was never authored,
because build-chart itself was never filled.

## What each state writes

It writes back into the candidate note its line already created, and mints
nothing. Three sections, per the candidate item card:

- How it works — the whole architecture, and especially the seams.
- What it costs — rough feasibility checks, proportional and no more.
- What it leans on — what has to be true for it to work.

Nothing here is scored. Judging stays at evaluate-set.
