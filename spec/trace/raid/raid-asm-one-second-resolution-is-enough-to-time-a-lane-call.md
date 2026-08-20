---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-one-second-resolution-is-enough-to-time-a-lane-call
type: "[[raid]]"
kind: assumption
statement: "The one-second convention that bounds every modelled interface is fine enough to time a lane call, so a benchmark built on it can tell a fast machine from a slow one."
owner: the maintainer of the machine
trigger: the first report that ranks states by cost
status: open
impact: "A ranking built on a clock coarser than the thing it measures orders states by rounding. Improvements smaller than the tick are invisible, which is most of them."
breaks_how_badly: corrosive
how_likely: plausible
probe: "unprobed — nobody has counted resolutions per lane call. The pair of one-second bounds this iteration carries neither discharge nor fail for that reason."
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

## Why it is filed rather than fixed

IT IS A NEW UNKNOWN THIS MILESTONE CREATED, not one it closed. The one-second
pair on `if-benchmark-binding-to-guard` and its sibling do not discharge and do
not fail, and that is the honest state of them.
