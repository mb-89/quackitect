---
minted_in: i51
id: opt-the-estimate-is-linear-on-the-work-s-own-count
type: "[[option]]"
statement: the time remaining is elapsed time divided by the fraction of the work's own countable unit that is finished, and the measured error is on the safe side and shrinks as the work proceeds
cluster: cluster-the-estimate
found_by: probe
source: "a probe run at i51 find_by_probing on 2026-08-21, replaying this session's own recorded run of 175 test files"
---

## Mechanism

THE WORK COUNTS ITSELF. A run writes a first line naming how many units it
will do, then a line per unit as each finishes, each carrying the elapsed
clock.

THE ESTIMATE IS ONE DIVISION. Elapsed, divided by units done over units total,
gives the predicted total. Subtract elapsed for the remaining.

No history, no model, no previous run.

## What the probe measured

The question, written before the run: does a linear estimate track the real
remaining time, or is it wrong enough to be useless?

The subject was this session's own battery, 175 test files, true wall 91,682
ms. Nothing was faked — the recorded progress of a real run was replayed.

| elapsed | units done | predicted total | true total | ratio |
| --- | --- | --- | --- | --- |
| 8,313 ms | 11 of 175 | 132,252 ms | 91,682 ms | 1.44 |
| 26,031 ms | 42 of 175 | 108,463 ms | 91,682 ms | 1.18 |
| 45,209 ms | 78 of 175 | 101,430 ms | 91,682 ms | 1.11 |
| 66,532 ms | 126 of 175 | 92,406 ms | 91,682 ms | 1.01 |
| 83,950 ms | 159 of 175 | 92,398 ms | 91,682 ms | 1.01 |

## Why the shape of the error matters more than its size

EVERY ROW OVER-PREDICTS. The estimate says the work will take longer than it
does, at every point measured.

THAT IS THE SAFE DIRECTION FOR THIS PRODUCT. A caller told to wait longer than
necessary sits idle for a moment. A caller told to wait less asks again too
early, which is the polling this iteration exists to end.

AND IT CONVERGES. Within 1 percent by three quarters of the way through, and
under 20 percent after a quarter. The worst reading is the earliest one, when
the caller has least invested in believing it.

## What the pre-agreed fallback was

Written before the run: if the estimate is off by more than a factor of two at
the halfway point, the linear model is a dead end and the answer becomes a
window rather than a point.

IT WAS NOT TRIGGERED. At halfway the ratio is 1.11.

## What it does not cover

A PIECE OF WORK WITH NO COUNTABLE UNIT. A shell command reports elapsed time
and nothing else — observed directly in the same probe, where seven listed
shell jobs carried a duration and no denominator.

For those the honest answer is that no estimate can be given, and that is
`req-a-time-remaining-names-its-basis` doing its job rather than a gap.

## What it does not claim

ONE RUN, ONE MACHINE, ONE KIND OF WORK. The convergence is measured on a test
battery on this container. Nothing here says a differently shaped job behaves
the same, and a second measurement is cheap enough to be worth taking.
