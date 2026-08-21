---
minted_in: i51
id: raid-asm-a-first-run-has-timings-to-estimate-from
type: "[[raid]]"
kind: assumption
statement: A job asked how much longer it needs can answer from work already recorded, because a previous run of the same job left its figures behind.
owner: the driving agent
trigger: the first time a job is asked for a time remaining on a machine that has never run it
status: open
probed: "unprobed 2026-08-21 — i51 owns the background-job status path needed for the fresh-timing-store check; this i45 test-maintenance iteration does not alter or delete that store."
probe: "Start a battery on a container with no recorded timings and ask it how much longer it needs. Read what the answer says."
impact: "The estimate is the whole point of the first goal. Where no history exists the arithmetic has no inputs, so the answer is either absent or invented, and an invented one is worse than none."
breaks_how_badly: corrosive
how_likely: likely
source_refs:
  - wt-one-lane-call-should-report-the-state-of-every-piece-of-work
  - i51
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
