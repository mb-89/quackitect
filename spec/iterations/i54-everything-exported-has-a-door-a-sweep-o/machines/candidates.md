---
steps:
  - id: the-narrow-guard
    statement: compose cand-the-narrow-guard - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
  - id: buy-the-sweep
    statement: compose cand-buy-the-sweep - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
  - id: the-handed-capability
    statement: compose cand-the-handed-capability - the seams, the rough costs, and what it leans on
    depends_on: []
    realization: document
---

# The candidate drawing

One compose state per line drawn on the chart at build_chart.

Three lines were drawn, so three states stand here. Each one composes a single
candidate node in full.

## What a compose state writes

The node already carries its name, its statement and its picks. Those were
written when the line was drawn, because the chart check demands them before it
will accept a line at all.

What the compose state writes is the three prose sections:

- **Why this one** — the argument for the combination, not for its parts.
- **How it works** — the seams. Where the rule is stated, what enumerates the
  governed set, where a departure is recorded, what judges each thing.
- **What it costs** — the rough cost, in the work it demands and in the
  freedom it takes away.
- **What it leans on** — the assumptions the candidate would fall over
  without, named by their register entries.

## Why they run in parallel

No candidate depends on another. Each one is a separate curve through the same
box, and reading one does not change what the next one says. `depends_on` is
empty on all three for that reason.

## The three lines

- `the-narrow-guard` — the write-time check judges only the write in front of
  it, and the sweep carries the rest.
- `buy-the-sweep` — an off-the-shelf boundary checker holds the rule, and this
  tree stops owning the enforcement code.
- `the-handed-capability` — a module is handed what it may reach instead of
  importing it, so the reach cannot be taken without being given.

## The baseline

The unchanged tree enters each state as a fixed block. It is what the candidate
is measured against, and it is not itself a line on the chart.
