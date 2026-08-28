---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: tsp-the-surface-answers-no-worse-while-the-engine-is-busy
type: "[[test-spec]]"
statement: A surface answers no worse while something else is running long than it does when nothing is.
method: test
verifies:
  - req-a-slow-answer-does-not-freeze-the-surface-beside-it
files:
  - deliverable/tests/mirror-contract.test.ts
---

## Steps

1. With nothing else running, make twenty surface requests and record each
   answering time. This is the baseline.
2. Start one engine request that will run well past its bound.
3. While it runs, make twenty surface requests of the same kind and record each
   answering time.
4. Compare the two medians.
5. Assert the loaded median is not materially worse than the baseline median.

## The oracle

THE SURFACE AGAINST ITSELF. Loaded times against quiet times, same requests,
same count.

## Why it is not measured against the surface's own bound

AN EARLIER DRAFT BORROWED THAT BOUND and a reviewer showed it admits the very
failure the row forbids. That bound carries an escape: answer within a second,
OR say what you are doing and finish in the background. A surface could paint a
word in forty milliseconds, then do nothing for a hundred and ten seconds, and
pass while the person watched a frozen screen.

AND THE BORROWED BOUND WOULD HAVE GONE RED FOR THE WRONG REASON. Four fifths of
this surface's slow answers coincide with no long engine call at all, so it is
slow on its own account. Measuring it against itself subtracts that as
arithmetic rather than as judgment.

## What would make this test lie

TOO FEW REQUESTS. The surface's own variance is wide, so a handful of samples on
each side can differ by more than the effect being measured.

A LOAD THAT IS NOT LONG ENOUGH. The held request must outlast all twenty loaded
samples, or some of them are taken after it finished and the two groups blur.

## What this does NOT verify

THAT THE TWO SHARE A LOOP. That is an assumption, probed separately and holding
at three times baseline. This spec asserts the behaviour whatever the mechanism,
and it keeps its meaning if the two are ever separated: the test simply passes
for a better reason.
