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
probe: "COUNTED. Forty-seven code sites in the engine, not the three the record claimed. One real resolver, three scripts that re-implement it, seventeen consumers and twenty-six hard-codes that never ask a resolver. Four more hard-codes outside the engine, one of them .gitignore. Twenty-four test files and about twenty documentation files name it directly."
probed: 2026-08-19
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

## What the spike counted, 2026-08-19

FORTY-SEVEN CODE SITES IN THE ENGINE. The record said one place, about three
lines. It is wrong by roughly a factor of fifteen, and the four-modules guess in
this entry's own source line was an undercount too.

THE SPLIT IS WHAT MATTERS, not the total.

- RESOLVER, four. One intended resolver, and three scripts that re-implement it
  independently. One of those resolves relative to the working directory rather
  than the root.
- CONSUMER, seventeen. They take the folder path and join a filename onto it.
  These are safe under a move, because they ask.
- HARD-CODED, twenty-six. They write the folder name themselves and never ask a
  resolver. This is the dangerous kind and it is the majority.

OUTSIDE THE ENGINE, FOUR MORE NON-DOCUMENTATION HARD-CODES. One of them is
`.gitignore`. Miss that one and machine state gets committed.

TWENTY-FOUR TEST FILES BUILD THE PATH THEMSELVES. They fail loudly, which makes
them the move's safety net rather than its risk.

ABOUT TWENTY DOCUMENTATION FILES NAME IT, and three of those reach the agent
through the prompt layer on every turn. A stale path there misdirects the agent
directly rather than breaking a program.

NINE MORE ARE SERVED STRINGS. Tool descriptions, refusal remedies and banners
that quote a path to the agent. They build nothing and each becomes a wrong
instruction after the move.

## Where the count is still blind

THREE TREES WERE NEVER SEARCHED, all because version control ignores them and
the search honours that: the build output, the machine-state folder itself, and
the workbench.

THE FOLDER'S OWN CONTENTS MATTER MOST OF THOSE. A generated client script is
written into it with usage text naming the folder, and no search above could see
it.

TWO ENVIRONMENT VARIABLES CARRY THE FOLDER BY VALUE into every condition script
and into the test reporter. Any script that reads one gets the path without
naming it, so no search for the literal can find those call sites.
