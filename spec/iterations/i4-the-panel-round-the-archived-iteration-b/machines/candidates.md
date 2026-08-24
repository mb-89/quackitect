---
steps:
  - id: the-guarded-collapse
    statement: "compose cand-the-guarded-collapse - the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: the-repeater-surface
    statement: "compose cand-the-repeater-surface - the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
  - id: the-host-first-surface
    statement: "compose cand-the-host-first-surface - the seams, the rough costs, and what it leans on"
    depends_on: []
    realization: document
---

# The candidate drawing

One compose state per line drawn on the chart at build_chart. Three lines were
drawn, and they are sampled along one axis: what the surviving surface is
forbidden to do.

- THE GUARDED COLLAPSE forbids a second surface from existing. One entry point
  emits every widget and a check refuses any other module that does. It is the
  only line that stops the failure recurring rather than removing it once.
- THE REPEATER SURFACE forbids the surface from deciding anything. The engine
  computes the whole view and the surface draws it, so two surfaces could not
  disagree even if somebody built one. It attacks the cause instead of the
  count.
- THE HOST-FIRST SURFACE forbids us from drawing what the host already draws.
  The states become the editor's own tree items and only the graph-shaped
  parts stay custom. It shrinks the surface rather than moving it.

ALL THREE START FROM THE SAME COLLAPSE, which is the round's own scope. What
separates them is the one extra decision each makes on top of it.

They are independent and all three hang off start; the join waits for every
one.

## What each state writes

Each compose state fills three sections of the candidate note its line already
created, and mints nothing.

- How it works — the whole architecture, and especially the seams between the
  chosen options.
- What it costs — the rough feasibility checks, proportional and no more.
- What it leans on — what has to be true for it to work.

## What is not composed here

NO SPIKES. The rough checks belong to this milestone; the deep ones belong to
the spike milestone, on the winner alone.

NO SCORING. Judging happens at evaluate-set, and an agent that knows the score
while it writes the description writes a description that earns the score.

ONE HONEST UNKNOWN RIDES INTO THE COMPARISON. Whether the walk is tree-shaped
enough for the host's own widgets cannot be answered by a script, so the
host-first line carries an unprobed assumption rather than a number.
