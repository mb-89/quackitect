---
steps:
  - id: claims-branch
    statement: "compose cand-claims-branch - the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: refs-cas
    statement: "compose cand-refs-cas - the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: preassign
    statement: "compose cand-preassign - the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
---

# The candidate drawing

One compose state per line drawn on the chart at build_chart. Three
lines were drawn, so there are three states - the blessed architecture
composed whole, the purist refs shape drawn to make it defend its extra
branch, and the null option drawn as a full line so the evaluation must
beat it.

They are independent and all hang off start; the join waits for every
one.

## What each state writes

It writes back into the candidate note its line already created, and
mints nothing:

- How it works - the whole architecture, and especially the seams.
- What it costs - rough feasibility checks, proportional and no more.
- What it leans on - what has to be true for it to work.

Nothing here is scored. Judging stays at evaluate-set.
