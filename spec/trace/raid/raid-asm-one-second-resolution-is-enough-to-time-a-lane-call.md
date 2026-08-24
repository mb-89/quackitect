---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-one-second-resolution-is-enough-to-time-a-lane-call
type: "[[raid]]"
kind: issue
statement: "The one-second convention that bounds every modelled interface is fine enough to time a lane call, so a benchmark built on it can tell a fast machine from a slow one."
owner: the maintainer of the machine
trigger: the first report that ranks states by cost
status: open
impact: "A ranking built on a clock coarser than the thing it measures orders states by rounding. Improvements smaller than the tick are invisible, which is most of them."
breaks_how_badly: corrosive
how_likely: plausible
probe: "the probe below was run on 2026-08-21 over 290 calls. The median is 1 ms, a thousandth of the convention's unit, so a one-second bound cannot express a demand about a typical lane call."
probed: "2026-08-21, and it is FALSE for the median call. The kind is now issue. The remaining resolution study belongs with benchmark work; i45 does not change the timing convention or benchmark reporting."
source_refs:
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Where it comes from

THE CORPUS HAS ONE TIMING CONVENTION and seventeen interfaces use it: a bound
of one second. This iteration invented a millisecond bound, discovered the
invention was its own, and went back to the convention with the divisor named
as unmeasured.

THAT LEFT A QUESTION NOBODY ANSWERED. Is a second the right unit for the thing
being timed?

## What is actually known

`engine/calllog.ts` records `duration_ms` per dispatch, so the LOG is
millisecond-resolution. The convention is about BOUNDS, not about the clock.

SO THE ASSUMPTION IS NARROWER THAN IT LOOKS. The clock is fine. What is unknown
is whether a bound expressed in seconds can express a useful demand about a call
that takes single-digit milliseconds.

MEASURED THIS MILESTONE: an ancestry test costs 4229 microseconds, and the cost
is the process spawn. That is four thousandths of the convention's unit.

## Probe

Count resolutions per lane call on one walk's log. If the median call is orders
of magnitude under a second, the convention cannot express a demand about it and
the interfaces that use it are documenting a ceiling nobody could breach.

## Why it was filed rather than fixed

IT WAS A NEW UNKNOWN THAT MILESTONE CREATED, not one it closed. The one-second
pair on `if-benchmark-binding-to-guard` and its sibling did not discharge and
did not fail, and that was the honest state of them.

## PROBED 2026-08-21 — FALSE FOR THE MEDIAN, TRUE FOR THE TAIL

The probe this entry asked for was run, on one walk's log, at i51's
probe-assumptions.

OVER 290 CALLS CARRYING A DURATION: minimum 0 ms, median 1 ms, p90 580 ms, p99
1712 ms, maximum 2275 ms. 271 of the 290 came in under a second.

THE MEDIAN IS ONE THOUSANDTH OF THE CONVENTION'S UNIT. A bound expressed in
seconds cannot express any demand about a call like that, and it cannot rank
two machines whose calls differ by hundreds of milliseconds. That is what the
entry predicted, and it is why the kind is now issue rather than assumption.

THE TAIL IS THE HALF THE ENTRY DID NOT PREDICT. 19 of 290 calls exceeded the
second, which is 6.6 percent. So the bound is NOT a ceiling nobody could
breach. It is breached routinely, and the interfaces that use it are
documenting a real demand about the slow tail while saying nothing about the
body of the distribution.

WHAT THAT MEANS FOR A BENCHMARK. Ranking states by a one-second bound orders
them by rounding, exactly as the impact line says. Ranking them by the
recorded `duration_ms` does not, because the log itself is
millisecond-resolution and always was.

SO THE FIX IS NOT A FINER BOUND. It is to stop reading the interface
convention as the benchmark's clock. The two answer different questions and
only one of them was ever about resolution.
