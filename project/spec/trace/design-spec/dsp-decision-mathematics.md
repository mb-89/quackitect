---
minted_in: i1
id: dsp-decision-mathematics
type: "[[design-spec]]"
statement: the M4 and M5 mechanics computed from nodes, carried by one module per method with nothing typed by hand
realizes:
  - el-method-compiler
files:
  - project/deliverable/engine/dsm.ts
  - project/deliverable/engine/pugh.ts
  - project/deliverable/engine/pareto.ts
  - project/deliverable/engine/compare.ts
  - project/deliverable/engine/elematrix.ts
  - project/deliverable/engine/morphbox.ts
  - project/deliverable/engine/bin/flow-closure.ts
  - project/deliverable/engine/bin/grades-complete.ts
---

## Responsibility

The structural verdicts and decision views: the DSM with partitioning
and banding, the Pugh convergence, the Pareto front, the pairwise
comparison walk, the element matrix with its owed interface cells, the
morphological chart, and flow closure. Each derives from nodes and
recomputes on every look; a verdict typed by hand is the defect these
exist to remove.

## Every register entry carries its grades

EVERY REGISTER ENTRY CARRIES ITS GRADES, AND EVERY GRADE IS ON THE SCALE —
the check behind rank-unknowns.

The exposure ranking is damage times likelihood, computed off
`breaks_how_badly` and `how_likely` on every open entry. An ungraded entry
cannot rank, so it silently falls out of the chart the pick reads — a
register row nobody weighs is a risk nobody sees (owner ruling 2026-08-11:
the state may not pass while any entry stands ungraded, whoever wrote it).

TWO CHECKS USED TO DISAGREE, AND THE WEAKER ONE GUARDED THE STATE.
This script asked only that the key was NON-EMPTY, and a mint comment is
non-empty. The exposure chart asked that the VALUE was on the scale, and
gave anything else likelihood -1, which never places a dot.

WHAT THAT COST, measured 2026-08-14 (note-3465043278d3): nine entries still
carried the mint comment and twenty-two more carried words nobody put on the
scale — certain, near-certain, likely, possible, unlikely, rare. Thirty-two
entries invisible to the pick, with this script green.

SO IT READS THE CATALOGUE NOW, and the catalogue is read from the card that
declares it rather than repeated here. meth-damage-scale carries
`catalog: damage_levels` and meth-likelihood-scale its sibling. Editing a
card changes what this accepts, in the same breath.

  node engine/bin/grades-complete.ts --root <project root>

## How many there are to settle

HOW MANY THERE ARE TO SETTLE, and how many are settled (owner ruling
 2026-08-08: "don't show the remainders — show how many overall we have
 and how many we've already done").

 An ordering walk counts ITEMS PLACED against items to place. An
 equivalence walk counts PAIRS ANSWERED against pairs to answer.

 WHAT THIS REPLACED, and why. The old field was an ESTIMATE of pairs
 still to ask: items left times the answers-per-item observed so far. It
 could rise, and its own comment defended that as honest. It was worse
 than dishonest — it was unbounded. Ninety criteria with a run of probe
 misses reported about five thousand questions outstanding, which is more
 than the entire cross product would have been, and the owner reasonably
 read it as the sort having failed.

 BOTH OF THESE ARE MONOTONIC AND TRUE. done never falls, total moves only
 when the register does, and neither is a prediction about answers nobody
 has given yet.

## The morphological box

THE MORPHOLOGICAL BOX — rows are function clusters, cells are the options
serving them, and a line across the box is one candidate architecture.

IT IS DERIVED, NEVER STORED. The grid is a view over the option nodes the
seven finders minted: each option already carries the cluster it serves, its
statement, which finder found it and whether it was pruned. Before
2026-08-08 the state kept a flat table repeating all of that, which is a
second copy of the truth and the exact thing node-table exists to prevent.

NOTHING HERE KNOWS ABOUT THIS REPOSITORY, on purpose. No file reading, no
trace, no node types — rows, cells and lines are the whole vocabulary. The
owner wants this tool lifted out and used elsewhere one day, and that only
stays possible if the boundary is drawn now rather than retrofitted.

So the READING lives in stateform.ts beside the other field derivations, and
what crosses into here is already plain data.

## A wiki link a path or a bare id

A wiki link, a path or a bare id all name one node.

 THE YAML QUOTES COME OFF FIRST (owner, 2026-08-09). A block list writes
 its items quoted, so a pick reads back as the seven characters "[[opt-a]]"
 WITH the quotes. The bracket strip then matches nothing, the id keeps its
 quotes, and it equals no cell on the chart — so every line drew with zero
 waypoints and reported itself unfinished.

## Which rows a line has not visited yet

Which rows a line has not visited yet. Empty means complete.

 A LINE IS A CANDIDATE ONLY WHEN IT IS COMPLETE (owner ruling 2026-08-08).
 It is still KEPT while unfinished — a person part-way through a thought is
 the normal case — so this reports rather than refuses, and the editor draws
 an unfinished line dashed with a count of the rows still to go.

## The pareto front

THE PARETO FRONT, COMPUTED. Nobody types it.

Domination is one line of arithmetic — a candidate is dominated when another
is at least as good on every axis and better on one — so the front and every
elimination are a FUNCTION of the score table.

WHY THIS EXISTS (owner report 2026-08-08). evaluate-set asked a person to
TYPE the non-dominated set and the eliminations, both free text. That asks
somebody to hand-compute an answer the scores already contain, and it lets
the typed answer disagree with the scores in the same form, silently. The
owner read the form and asked who eliminates. Nobody does; arithmetic does.

WHAT A PERSON STILL OWES is the judgment arithmetic cannot make: whether an
elimination is accepted, and anything the numbers do not capture.

NOTHING HERE KNOWS ABOUT THIS REPOSITORY. Candidates, axes and scores are
the whole vocabulary, so the same code would rank anything.
