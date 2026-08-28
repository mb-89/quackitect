---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-asm-a-first-run-has-timings-to-estimate-from
type: "[[raid]]"
kind: issue
statement: A job asked how much longer it needs can answer from work already recorded, because a previous run of the same job left its figures behind.
owner: the driving agent
trigger: the first time a job is asked for a time remaining on a machine that has never run it
status: open
probed: 2026-08-21, and it is FALSE. Both timing records were absent on this fresh container and the product said so rather than guessing. The kind is now issue, because it has already happened.
probe: Start a battery on a container with no recorded timings and ask it how much longer it needs. Read what the answer says.
impact: The estimate is the whole point of the first goal. Where no history exists the arithmetic has no inputs, so the answer is either absent or invented, and an invented one is worse than none.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - wt-one-lane-call-should-report-the-state-of-every-piece-of-work
  - i51
place: i50-the-unattended-deadline-a-wait-or-an-owe
---

## Why it is open

The iteration's vision states the estimate as arithmetic rather than a guess.
Its words: a battery knows its case count from the previous run.

That is true on a machine that has run before. It is false on a fresh one.

## Where it bites

A cloud container is cloned fresh and reclaimed when it goes idle. Nothing is
waiting for it, and that includes the recorded timings.

`.se/test-timings.jsonl` and `.se/test-last-run.json` are machine-local. On
this very run they did not exist at boot.

So the FIRST battery on every cloud box is exactly the case with no inputs.
That is not a rare edge — it is every unattended run's first test call.

## What an honest answer looks like

The design must say what the report returns when it cannot estimate.

Saying "running, no estimate yet" is a complete answer and a good one. What
must not happen is a number with nothing behind it, because a caller that
reads forty seconds will wait forty seconds.

## Probe

Delete the recorded timings, start a battery, and ask for the state of the
work.

Two outcomes, both useful.

- The answer names its own ignorance, and the assumption is retired as
  handled.
- The answer names a figure, and where that figure came from is the next
  question.

## PROBED 2026-08-21 — IT IS FALSE, AND THE KIND IS NOW ISSUE

It has already happened, on this very run, so it is no longer something merely
believed.

WHAT WAS CHECKED. `.se/test-timings.jsonl` and `.se/test-last-run.json` on this
container. Both absent, reported as ENOENT.

WHAT THE PRODUCT SAID WHEN ASKED. The handoff note read "No earlier battery is
on record to size the wait." That is the honest answer this entry hoped for,
and it is already the house behaviour rather than something to build.

SO THE ASSUMPTION IS FALSE AND THE DEMAND SURVIVES. A first run genuinely has
no history to estimate from. What changed is that history turned out not to be
needed.

## WHAT NOW RESTS ON NOTHING, AND WHAT REPLACES IT

THE VISION'S WORDING RESTS ON THIS. i51's rough vision says a battery knows its
case count from the previous run, so the estimate is arithmetic rather than a
guess. The clause "from the previous run" is now known false.

THE DEMAND DOES NOT REST ON IT. `req-a-time-remaining-names-its-basis` asks for
a basis and for honesty where none exists. It never named history as the basis.

THE REPLACEMENT IS PROBED AND STANDS. A running job reports its own progress
live, with its denominator in the first line of the record.
`raid-asm-work-under-way-records-progress-before-it-ends` was probed the same
day and holds, and the arithmetic was run against a live run.
