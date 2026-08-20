---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-a-benchmark-run-is-one-sample-and-nothing-repeats-it
type: "[[raid]]"
kind: issue
statement: A benchmark run measures a single sample of a stochastic process, and nothing in the design repeats a run under identical conditions to say how much of a difference is noise.
owner: the driving agent
trigger: the first time two benchmark reports are compared to decide whether a machine change helped
status: open
looked: 2026-08-20
impact: Two reports differing by twenty per cent could be a real improvement or could be two draws from one distribution, and the reports carry nothing that separates the two. A decision made on one pair of runs is a decision made on noise.
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - i37-training-iterations-a-disposable-iterati
---

## Where it comes from

THE STATE-OF-THE-ART CHECK at the 2026-08-20 retro. The benchmark design was
compared against five outside practices and matched or bettered four of them.

This is the fifth, and it is the one live gap.

## The outside answer

TAU-BENCH REPORTS `pass^k` (arXiv 2406.12045): the probability that all k
independent runs of the same task succeed. It exists precisely because a single
agentic run is a draw rather than a measurement, and a headline number from one
draw reads as far more solid than it is.

OUR CASE IS THE SAME SHAPE AND WORSE IN ONE WAY. An agent walking a machine is
at least as variable as an agent answering a task, and the thing being measured
here is a DIFFERENCE between two walks. A difference of two noisy quantities is
noisier than either.

## What would close it

- REPEAT A BOUND RUN UNDER IDENTICAL CONDITIONS and report the spread beside
  the number. The conditions stamp already exists and already pins everything
  that would have to be held equal, so the hard half is built.
- THE REPORT CARRIES THE SAMPLE COUNT, so a reader can tell one run from five
  without going to the log.

## What it does not ask for

NOT A LARGE k. Even two runs turn "the number moved" into "the number moved by
more than the two runs differed from each other", which is the whole
distinction. The cost of a run is a full walk, so the design should assume k is
small and say what it can honestly say at that size.
