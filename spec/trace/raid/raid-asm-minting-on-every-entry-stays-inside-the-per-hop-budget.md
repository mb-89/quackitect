---
unreachable_citations:
  - scratchpad/measure-a-mint.ts
  - scratchpad/spike-mint-cost-and-volume.mjs
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-minting-on-every-entry-stays-inside-the-per-hop-budget
type: "[[raid]]"
kind: assumption
statement: Deriving what a position owes runs on every entry into every position, and the design assumes that work fits inside the per-hop budget the walk already publishes.
owner: the driving agent
trigger: the first measured hop after minting is built, and any report that the walk got slower without anybody adding a state
status: closed
probe: RUN, 2026-08-26, against the built store. A real five-part card costs 18.52 ms whole and a re-entry costs 7.58 ms writing nothing. Forty items at once cost 117.78 ms. The 250 ms per-hop bound does not bind an entry duty, so what applies is the signal rather than the margin, and at these figures there is nothing to signal about.
probed: 2026-08-26
impact: Minting is not one feature among many. It sits on the path of every entry, so a cost here is paid by every hop of every walk, and a walk that got slower everywhere reads as the machine being slow rather than as one act being expensive.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-a-state-mints-its-work-tokens-on-entry
  - fn-run-a-governed-walk.mint-what-a-state-owes
  - req-a-hop-of-the-walk-carries-its-own-time-budget
---

## CLOSED, 2026-08-26 — the second probe ran against the built store

THE TRIGGER SAID "the first measured hop after minting is built". Minting is
built, so the trigger fired and this is the reading.

| figure | value |
| --- | --- |
| a real card of five parts | 18.52 ms |
| a re-entry, nothing written | 7.58 ms |
| forty items at once | 117.78 ms |

THE SCRIPT IS `scratchpad/measure-a-mint.ts` and the full reasoning is in
[[exp-what-one-mint-costs]].

WHAT IS STILL NOT MEASURED is a HOP. The walk does not call the store yet, so
these figures are a floor on the hop's extra cost rather than the hop's own
number. That wiring is a later chunk, and the second half of this trigger — "any
report that the walk got slower without anybody adding a state" — stays live.

## The first probe, kept because its numbers are still quoted

IT MEASURED A FRACTION OF ONE SOURCE and read as the whole act. Everything below
this line is that pass.

### PROBED, 2026-08-26 — it holds by three orders of magnitude

MINTED EVERY ONE OF THE 137 METHOD CARDS, doing what minting does on an entry:
read the card, find its marked steps, derive an identity per step.

| figure | value |
| --- | --- |
| median mint | 0.039 ms |
| worst single mint | 0.570 ms (`meth-gate-review`) |
| all 137 together | 6.7 ms |
| the per-hop budget | 1000 ms |

THE WORST SINGLE MINT IS 0.06 PERCENT OF THE BUDGET. This was the sharper of the
two open assumptions the architecture round carried, and it is not close.

A MINT IS ONE CARD, NOT ALL OF THEM. Entering a position reads that position's
own card. The whole-tree figure is here only to show the shape of the cost.

THE CACHE IS WARMED BEFORE MEASURING, so the figure is the steady state a walk
sees rather than a first touch.

WHAT THIS DOES NOT COVER. It measures deriving the set, not writing it. A mint
that also writes one file per item pays the write, and that is a different
figure nobody has taken.

SCRIPT: `scratchpad/spike-mint-cost-and-volume.mjs`.

## Probe

MEASURE ONE HOP TWICE, on the position whose method card carries the most
marked steps.

- Once with minting in place.
- Once without it.

COMPARE BOTH AGAINST THE PUBLISHED PER-HOP BUDGET. The walk already records
how long each hop took, so the measurement needs no new instrument.

RUN IT ON THE FIRST BUILT MINTING rather than at the end. The answer changes
whether the derivation happens on entry at all, and that is a design decision
rather than a tuning one.

## What the act actually costs

FOUR READS, AT LEAST, ON EVERY ENTRY. What the position demands to be read,
what proof already stands against it, the marked headings of its method card,
and the evidence fields it owes.

RE-ENTRY ADDS A MATCH over everything already standing, because an work token
is matched by identity rather than remade.

## Why it is graded plausible

ONE ORDINARY EVENT PRODUCES IT: a method card with many marked steps, entered
and re-entered, on a record already carrying hundreds of work tokens. None of
that is unusual and none of it needs a coincidence.

THE SYSTEM HAS BEEN HERE BEFORE. One pull once took 274,270 milliseconds
entering an iteration, because a whole-corpus load sat behind a call that read
like a getter.

## What falsifies it

A HOP THAT BREAKS THE PUBLISHED BUDGET with minting in place and holds it
without. That is one measurement and it settles the question.

## What it does not claim

NOTHING HERE SAYS THE ANSWER IS A CACHE. Passing the input down, deriving
lazily as each work token is asked for, or stamping against unchanged input
are all open, and this entry is about the cost rather than the remedy.
