---
unreachable_refs:
  - cand-the-refusing-run-with-recorded-conditions
minted_in: i37-training-iterations-a-disposable-iterati
id: if-benchmark-binding-to-guard
type: "[[interface]]"
statement: The binding hands the guard the rewind commit and the fact that a run is open, and the guard answers every later resolution against them.
source: el-benchmark-binding
destination: el-benchmark-guard
carries:
  - flow-bound-run
form: in-process call
bound: inherited from req-call-answers-in-one-second, divided by the resolutions a lane call makes. THAT COUNT IS UNMEASURED, so the crossing has no number yet and this says so rather than inventing one.
source_refs:
  - i37-training-iterations-a-disposable-iterati
  - cand-the-refusing-run-with-recorded-conditions
---

CROSSED ON EVERY RESOLVED COMMIT, REF AND PATH for the length of a run, so
its bound is the tightest in this iteration.

## What crosses

One value in one direction: the rewind commit, plus the fact that a run stands.
Nothing crosses back.

## Why the bound is a millisecond

The guard sits under every read, search, glob and list the walk makes. A
benchmark that slowed the walk it was measuring would measure itself, which is
the one failure this interface cannot be allowed to have.

## What it must never do

Fail open. Where the guard cannot answer, the crossing refuses
([[raid-dec-a-run-that-cannot-establish-its-guard-never-binds]]).

## Where the bound came from, and the correction

THIS CROSSING CARRIED `bound: 1 millisecond` from decompose-structure until
2026-08-19. THE AGENT CHOSE THAT NUMBER. It came from no requirement, no
ruling and no measurement.

IT WAS THE ONLY MILLISECOND BOUND IN THE CORPUS. Every other interface
declares one second, or says plainly that one second does not apply. So the
figure was a thousand times tighter than the only convention this product has,
on nobody's authority.

WHY IT MATTERED. `exp-does-an-ancestry-test-fit-inside-the-one-millisecond-bound`
returned `falls` against it, and that verdict was carried into the fold-back as
evidence that a checked ceiling cannot meet its bound. A verdict against an
invented threshold is not evidence about the design.

THE REASONING BEHIND THE NUMBER STILL STANDS AND THE NUMBER DOES NOT. The
guard sits under every resolved commit, ref and path a bound run makes, so a
benchmark that slowed the walk it measures would measure itself. That is the
real constraint.

SO THE BOUND IS DERIVED RATHER THAN ASSERTED, in the shape two other interfaces
in this corpus already use: it inherits the one-second answer bound, divided by
how many resolutions a lane call makes. Nobody has counted that, so there is no
number here yet, and the absence is the honest state.

WHAT WOULD SETTLE IT: count resolutions per lane call over a real walk. Until
then the 4229 microseconds measured for `git merge-base --is-ancestor` is a
fact without a threshold to fail.
