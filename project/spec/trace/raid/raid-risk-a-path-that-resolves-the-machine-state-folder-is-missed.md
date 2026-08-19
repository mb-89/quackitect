---
minted_in: i9
id: raid-risk-a-path-that-resolves-the-machine-state-folder-is-missed
type: "[[raid]]"
kind: risk
statement: "One place that builds a path from the machine-state folder is missed in the move, and it then reads an empty folder as a fresh start rather than as an error."
owner: the driving agent
trigger: "the first walk after the move, and again the first time a clone is made from a moved tree"
status: open
impact: "A missed caller writes to the old location or finds nothing at the new one. Finding nothing is the dangerous half, because an absent log or an absent set of notes looks exactly like a machine that has not run yet."
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - "the record claims the resolver is three lines; a search finds the folder path threaded as an argument through at least four other modules"
  - raid-iss-this-records-cited-line-numbers-moved-under-it
---

## What the risk is

THE FOLDER'S PATH IS NOT RESOLVED IN ONE PLACE. It is passed as an argument
into modules that each build their own file path from it — the call log, the
decision graph, the discipline state and the answer spill, at least.

MOVING IT MEANS FINDING EVERY ONE. Miss one and it keeps pointing where the
folder used to be.

## Why the failure is quiet rather than loud

AN ABSENT FILE IS A LEGAL STATE HERE. A machine that has never run has no call
log and no notes. So a caller that looks in the wrong place finds nothing, and
nothing is a real answer it already knows how to handle.

THAT IS THE SAME SHAPE THE PREDECESSOR GUARDED AGAINST. Its marker's absence
was a loud error and never a silent fallback, and the record already says to
weigh that answer first.

## What would make it visible

A COUNT BEFORE AND AFTER. Every module that builds a path from this folder is
enumerable, and the number is small enough to list. Listing it is the first act
of the move rather than a check afterwards.

## Why it is plausible rather than expected

THE MOVE IS DELIBERATE AND SOMEBODY IS LOOKING. What makes it plausible at all
is that the record's own figure for how many places are involved is wrong, so
whoever plans the work starts from a number that understates it.
