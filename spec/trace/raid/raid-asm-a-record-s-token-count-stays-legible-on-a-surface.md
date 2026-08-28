---
unreachable_citations:
  - scratchpad/spike-paths-and-counts.mjs
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-a-record-s-token-count-stays-legible-on-a-surface
type: "[[raid]]"
status: closed
kind: assumption
statement: The bubble surface assumes a state's token count is a small number a person reads at a glance, and nobody has counted what a real record actually owes.
owner: the maintainer
trigger: the count from an archived record, and any surface work that lays out a bubble before that count exists
probe: "holds on the half that was measured. Counted 2026-08-26 over this record's own 21 signed positions: 136 evidence fields, between 4 and 15 per position, median 5. A count of one or two digits is what a bubble was drawn for, so the surface assumption survives at the position grain. What is NOT measured is the whole-record total, because this record is mid-walk and its build and verification positions do not exist yet."
probed: 2026-08-26
impact: A bubble showing one digit and a bubble showing three digits are different designs. Laying out the surface against the wrong one means redoing it after everything else is settled.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## PROBED, 2026-08-26 — mostly true, with one outlier that decides the design

COUNTED OVER 137 METHOD CARDS, taking a marked heading as one outgoing piece of
work. 424 headings in total.

| figure | value |
| --- | --- |
| median per card | 2 |
| largest per card | 23 |
| cards over twenty | 1 |

THE MEDIAN POSITION OWES TWO THINGS. A count read at a glance is a fair
assumption for almost every card in the tree.

ONE CARD BREAKS IT and it is `meth-derive-criteria` at 23. Two more sit in the
teens: the gate review at 15 and requirement authoring at 14.

SO THE SURFACE MUST DRAW 23 WITHOUT BECOMING UNREADABLE, and it is drawing 2
almost every time. That is a different design problem from the one the
assumption imagined: not "is the number small" but "does the rare large one
degrade gracefully".

WHAT THIS DOES NOT SAY. Nothing here measures whether a person reads the number
faster than some bar. It measures the number.

SCRIPT: `scratchpad/spike-paths-and-counts.mjs`.

## Probe

ONE SCRIPT OVER AN ARCHIVED RECORD. Count the evidence fields across all its
states, and add the reading each state demands. That sum is roughly the number
of tokens that record would carry.

THE ANSWER IS A COUNT PER STATE AS WELL AS A TOTAL, because the bubble shows a
state's number rather than the record's.

RUN IT BEFORE THE SURFACE IS LAID OUT. The result changes the drawing, so
running it afterwards wastes the drawing.

## The one figure that exists

THIS ROUND'S OWN KICKOFF GATE BECAME FOURTEEN TOKENS, one per evidence field.
That is a single state.

A RECORD HAS MANY STATES and several fields each, so the record's own number
is some multiple of that. Nobody has multiplied it against a real record.

## Why the probe is cheap and has not been run

IT IS ONE SCRIPT over a folder that already exists. The reason it has not run
is sequencing rather than difficulty, and it is named at the kickoff gate as a
thing to do before the surface is designed.

## What falsifies it

A COUNT THAT DOES NOT FIT A BUBBLE. If a state routinely owes dozens, the
positional bubbles carry numbers nobody scans, and the surface needs a
different way to show how much is owed.

THAT IS NOT A DISASTER, IT IS A DESIGN INPUT. The point of probing now is that
the answer changes the drawing rather than the plan.
