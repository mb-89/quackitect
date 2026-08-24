---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-iss-the-hop-is-still-over-its-published-budget
type: "[[raid]]"
kind: issue
statement: "This entry claimed the walk misses its own per-hop budget by more than three times, and it measured the wrong thing; the flip the budget actually binds is 20 milliseconds against 250."
owner: the driving agent
trigger: it was raised, then refuted by the measurement it should have rested on
status: closed
impact: "While it stood: a false breach against a must-priority requirement, argued from a number nobody had checked against the requirement's own scope."
breaks_how_badly: serious
how_likely: expected
source_refs:
  - req-a-hop-of-the-walk-carries-its-own-time-budget
  - raid-iss-nothing-shipped-this-round-makes-the-walk-faster
---

## What it claimed

A HOP COSTS 854 MILLISECONDS AGAINST A BUDGET OF 250, so the round published a
bound its own engine missed by more than three times.

## Why that was wrong, in two ways

IT MEASURED THE WHOLE HOP AGAINST A BUDGET THAT BINDS ONE PART OF IT.
`req-a-hop-of-the-walk-carries-its-own-time-budget` splits a hop in a table at
its own lines 42 to 45. The FLIP is bounded. The WORK — the state's own reading,
condition scripts and entry duties — is not.

THE ENTRY NOTICED THE GAP AND ANSWERED IT BY ASSERTION. It said those three hops
"do almost no work of their own", and nothing measured that. One of them serves
the whole contract document for reading.

IT MEASURED A COLD PROCESS. The probe built a new session per run, so every hop
paid module loading, the first corpus read and the first machine compile. A live
engine pays those once, at boot.

## What the measurement says

WARM, WHICH IS WHAT A LIVE ENGINE IS. The phase trace splits hop one:

| part | cost | bounded |
| --- | --- | --- |
| reading proofs | 13 ms | no, it is the state's work |
| condition scripts | 1 ms | no, it is the state's work |
| the status the engine assembles | 20 ms | YES, this is the flip |
| the whole hop | 34 ms | |

THE THREE HOPS WARM: 34, 66 and 59 milliseconds. Attribute every millisecond of
the worst one to the flip and it is still 66 against 250.

COLD, THE SAME THREE COST 716, 325 AND 310. That is boot, and the owner ruled
boot may take as long as it takes provided the person is told something is
happening. That demand is
`req-a-slow-answer-does-not-freeze-the-surface-beside-it`, not this row.

## What closed it

A REVIEWER WITH FRESH EYES ASKED FOR THE MEASUREMENT THE ENTRY HAD SKIPPED. Its
words: the entry "settles it by assertion, not a measurement", and calling those
hops almost no work "is the claim the whole verdict rests on, and nothing
measured it".

THE REVIEWER WAS RIGHT AND THE ANSWER WENT THE OTHER WAY. It expected the
disagreement to need settling; the measurement refuted the entry outright.

## What this cost, recorded because it is the lesson

A FALSE BREACH AGAINST A MUST-PRIORITY REQUIREMENT STOOD FOR ABOUT AN HOUR, in
the register, in a gate verdict, and in a story's evidence.

IT WAS WRITTEN BY THE HAND THAT HAD JUST DONE THE SPEED WORK, which is exactly
the hand least able to see that its own probe was cold. The separation a gate
buys is what caught it.

THE NUMBER WAS REAL AND THE COMPARISON WAS NOT. 854 milliseconds is a true
measurement of something the budget does not bound. That is the harder mistake
to catch, because nothing about it looks like a guess.
