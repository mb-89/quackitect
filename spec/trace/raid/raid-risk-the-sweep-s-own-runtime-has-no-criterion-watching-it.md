---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-risk-the-sweep-s-own-runtime-has-no-criterion-watching-it
type: "[[raid]]"
kind: risk
statement: Adding a rule to the sweep costs time nobody is measuring against a bound, so the sweep grows past the point where anybody is willing to run it and stops being run.
owner: the driving agent
trigger: a sweep run that a person interrupts, or a check that is moved out of the sweep because the sweep takes too long
status: open
impact: A sweep nobody runs is a sweep that reports nothing. Every rule that leans on it degrades to an unenforced convention, and the degradation is silent because the sweep still passes when it is run.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - "evidence/evaluate-set.md: req-call-answers-in-one-second scored 3 for every candidate and for the baseline, so the latency axis carried no information"
  - "measured 2026-08-16 during this record: 974 ms over 3053 nodes"
  - "measured 2026-08-26 during this record: 1075 ms over 3092 nodes"
  - "measured 2026-08-26 at the architecture gate: 1270 ms over 3113 nodes"
---

## Why it stands

The one-second bound in this product governs a DRIVER'S CALL. The sweep is not
a driver's call, so nothing binds it.

That left the candidate evaluation with no way to tell three designs apart on
cost. Every one of them scored the same, and so did doing nothing.

## The two measurements

Both were taken during this record, on the same machine, three days apart.

| date | nodes | time |
| --- | --- | --- |
| 2026-08-16 | 3053 | 974 ms |
| 2026-08-26 | 3092 | 1075 ms |
| 2026-08-26, later the same day | 3113 | 1270 ms |

THE THIRD POINT IS THE WORRYING ONE. 21 more nodes cost 195 ms more, which is
far steeper than the 39 nodes that cost 101 ms before it. Two points could be a
line; three points that steepen are not.

The sweep has crossed the one second that the call bound uses as its reference,
and nothing anywhere noticed.

## What the numbers do and do not show

THEY ARE TWO POINTS, taken on one machine, with the corpus growing and the
rule set unchanged between them. That is enough to say the cost is not flat
and not enough to fit a curve.

WHAT IS NOT MEASURED: how much of the time is per node and how much is per
rule. A door rule added to the sweep reads every engine module, which is a
different shape of cost from reading every corpus node.

## Why it is a risk and not an issue

Nothing is broken. A sweep at 1075 ms is fine, and a person waiting on it
would not notice.

The risk is the SLOPE. Each rule added is cheap on its own, and no single
addition will be the one that makes the sweep unusable.

## What would retire it

A row in the register that bounds the sweep, with a measure somebody can
check, plus a recorded reading of how the cost splits between nodes and rules.
