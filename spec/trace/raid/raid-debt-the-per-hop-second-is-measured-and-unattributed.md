---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-debt-the-per-hop-second-is-measured-and-unattributed
type: "[[raid]]"
kind: debt
statement: A hop inside a large record costs about a second more than a hop outside one, the size of the gap is measured, and nothing has been shown to cause it.
owner: the adjudicator
trigger: FIRED. i68 is open and its whole goal is the walk's fixed per-call cost, so this entry's home is that record and its next look belongs there rather than at another retro
status: open
looked: 2026-08-28
look_verdict: rescheduled
impact: Every hop of every record pays it, so it is the single most-felt cost in the system. Leaving it unattributed means the next attempt starts from the same three disproved hypotheses.
breaks_how_badly: annoying
how_likely: certain
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
place: i41-green-is-computed-once-and-right-the-dia
---

## What is measured

A hop that owes nothing — no reading, no script, no evidence form — costs 1,700
to 2,300 ms inside i63. Boot and front-desk hops cost 650 to 990 ms. The
difference is the machine the walk stands in.

## What is disproved, each by measurement

THE STATUS PACKET. It draws a row per ACTIVE leaf, not per declared state. On a
bound fixture that is one row, so the sixty-four-state loop it was assumed to
run does not exist.

THE EXIT SCRIPTS. 95 to 619 ms each, and the most expensive hops declare none.

THE TRACE WALK UPWARD. 8 ms.

THE WORK STORE. Was 23 ms an ask, now memoised against a change signal, and the
live hop did not move.

THE CORPUS SWEEP ON THE PULL PATH. A warm pull on a bound fixture sweeps the
corpus zero times, in 11 ms. Pinned as a ratchet in
`deliverable/tests/packet-asks-once.test.ts`.

## What is true and unplaced

SIXTY-FOUR ASKS FOR THE CORPUS COST 1,461 ms, and the identical loop inside a
read-only pass costs 22 ms. That number is almost exactly the gap. Something
asks about that many times, and the instrument that would name it did not exist
until this iteration.

## What was built anyway

`corpusSweeps()` in `deliverable/engine/trace.ts` counts the expensive branch of
an ask, which `corpusAsks()` could not distinguish from a cheap one.

The packet's own states loop now runs inside a read-only pass. That is correct
and it is not proven to be worth anything, because the loop turned out to be
short.

## What closes it

THE FIXTURE HAS TO BIND A LARGE COLUMN. Every measurement above used a patch
column, which is five states. The question is whether the sweep count grows with
the state count, and a five-state fixture cannot answer it.

THEN THE COUNTER IS POINTED AT A REAL HOP inside a sixty-four-state record, and
whatever it names is the cause.

SWEPT 2026-08-28, at i63's closing retro: TRIGGER FIRED, AND THE MEASUREMENT IS
NOW ON THE RECORD.

This entry had never been looked at since it was minted. Its trigger names two
moments: a complaint that the walk is slow, and any change to the pull path.

THE RETRO'S OWN MINING IS THE COMPLAINT. Over 14,882 records from
2026-08-25T16:59:33.814Z, se_pull ran 918 times for 3,947 seconds. That is 66
minutes of pulling, at a median of 2.06 seconds and a mean of 4.30.

THE ATTRIBUTION IS STILL MISSING, which is exactly what this entry says. The
figure is a whole-call total. Nothing says which part of the hop spent it.

RESCHEDULED, with the trigger re-affirmed and the number attached. The next
hand to open the pull path inherits a measured baseline rather than an
impression.
