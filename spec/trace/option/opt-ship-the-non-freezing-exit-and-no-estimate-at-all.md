---
minted_in: i51
id: opt-ship-the-non-freezing-exit-and-no-estimate-at-all
type: "[[option]]"
statement: build only the deferred leaving verdict and the one-call listing, and report no time remaining at all, because the estimate is the second-order want and the freeze is the first
cluster: cluster-the-estimate
found_by: without
source: "trimming, via meth-trimming — asking of the estimate what if it does not exist, and who does its job instead"
---

## Mechanism

REMOVE THE DURATION FROM EVERY ENTRY. The report still lists every piece of
work out of sight and still says whether each is running.

It says nothing about how much longer.

WHO DOES THE JOB INSTEAD: the caller, by asking again. That is what it does
today, and the listing already makes asking cheaper than it was, because one
call covers everything rather than one call per handle.

## Why this is the interesting trim

THE METHOD SAYS TRIM WHAT IS EXPENSIVE. The estimate is the expensive part of
this iteration by every measure that matters.

- It carries two of the four register entries, one of them graded corrosive
  and expected.
- It rests on an instrument this project already records as unreliable, by a
  factor of twenty.
- It is the only part that can be WRONG rather than merely absent. A listing
  that omits nothing cannot mislead; a number can.

THE FREEZE IS THE CHEAP PART AND THE VALUABLE ONE. It moves the walk's
contract, which is real work, and it cannot produce a wrong answer.

## What survives without it

`req-a-leaving-check-does-not-hold-the-call` — untouched, and it is the
load-bearing goal.

`req-a-pending-verdict-is-recorded-against-its-state` — untouched.

`req-one-call-reports-every-piece-of-work-out-of-sight` — untouched, minus the
duration column.

`req-a-time-remaining-names-its-basis` — GOES ENTIRELY, and with it the whole
honesty problem it exists to solve.

## What is genuinely lost

THE CALLER STILL DOES NOT KNOW HOW LONG TO WAIT. It asks, sees "running", and
must guess an interval. That is polling with fewer calls rather than no
polling.

The work token that started this names the estimate as half of what it wanted,
so shipping without it is a partial answer and should say so.

## What the probe changed about this option

WRITTEN BEFORE THE PROBE RAN, this option would have been the recommendation.
The estimate looked expensive and unfounded.

THE PROBE MADE IT CHEAPER THAN IT LOOKED. A running job already reports
`cases_done`, `files_touched` and `files_total` beside `elapsed_ms`, so the
numerator, the denominator and the clock are all on the answer already. The
missing work is a division.

SO THIS OPTION IS STILL THE SAFE ONE AND NO LONGER THE CHEAP ONE. That is
exactly the kind of thing a trim is supposed to surface, and it surfaced it by
being asked rather than by being right.
