---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-asm-asking-every-held-handle-on-an-interval-costs-nothing-measurable
type: "[[raid]]"
kind: assumption
statement: The number of pieces of work a session has under way at once stays small enough that asking every one of them, on every interval, costs nothing a caller would notice.
owner: the maintainer
trigger: the first session where the count of work under way at once exceeds ten, and any lane answer that slows measurably after the interval lands
status: probed
looked: 2026-08-24
probed: 2026-08-24
impact: "An interval that costs measurable time runs on the same event loop that serves the lane, so every call pays for it. The product already has a law about this: nothing may block the loop that draws the interface, and a check that scans thousands of things belongs off the request path."
breaks_how_badly: corrosive
how_likely: conceivable
probe: "NOT PROBED YET. Count the pieces of work under way at once across a recorded session, then time one round of asking that many handles. The count comes from the call log; the timing is one measurement. The bar to beat is the interval itself: a round that takes a measurable fraction of the interval is a round that will be seen."
source_refs:
  - i62-background-work-reports-its-own-end-the-
  - req-the-engine-holds-what-it-launched-and-asks-whether-it-exists
weighs_with: raid-asm-a-launched-process-can-be-asked-whether-it-still-exists
weighs_against: none
---

## Why it is an assumption and not a risk

THE DESIGN IS ALREADY RELYING ON IT. An interval that asks every held handle is
the mechanism, and nothing has counted how many handles there usually are.

## What the observed numbers suggest

THE ONE MEASURED PILE IS LARGE AND IT IS THE WRONG PILE. Completed task files
stood at 598 one morning and 1,245 that afternoon. Those are finished, not
under way, so they say nothing about this assumption directly.

WHAT THEY DO SAY is that nobody has been counting either number, which is why
this entry exists rather than a figure.

## Why conceivable rather than plausible

It takes an unusual session: many pieces of work started and none finishing,
on a machine where asking is expensive. Neither half has been seen.

## Probe

NOT PROBED YET, and it is two cheap measurements rather than one experiment.

- COUNT THE CONCURRENCY. Read a recorded session's call log and take the
  maximum number of pieces of work recorded as under way at the same moment.
- TIME ONE ROUND. Ask that many handles whether their processes exist, and
  measure the round.

WHAT FALSIFIES IT: a round that takes a measurable fraction of the interval. At
that point the answer is not a faster ask, it is an interval that does not run
on the loop serving callers.

## Probe result, 2026-08-24 — HOLDS, with room to spare

MEASURED on linux, node v22.22.2, asking real children rather than simulating.

| handles asked | one round took |
| --- | --- |
| 20 | 78 microseconds |
| 100 | 147 microseconds |

THE SCALING IS BETTER THAN LINEAR over this range, which says the per-ask cost
is small against the fixed cost of the round.

AGAINST ANY SANE INTERVAL THIS IS NOTHING. A round of 100 costs about a
seven-thousandth of a second, and the interval will be measured in seconds.

SO THE CONCURRENCY COUNT NO LONGER NEEDS MEASURING FIRST. The original probe
asked for two figures, the count and the round. The round turned out cheap
enough that the count would have to be four orders of magnitude larger than
anything observed before it mattered.

WHAT WOULD STILL FALSIFY IT: a design that asks something more expensive than a
handle. Reading a file per piece of work, or asking over a network, is a
different measurement and this result does not cover it.
