---
minted_in: i1
id: tsp-walk-discipline
type: "[[test-spec]]"
statement: The walk advances only on a pull, weighs the slider on every hop, and answers from the record, verified by test over the pull and route machinery.
method: test
verifies:
  - req-a-clear-jump-is-one-call
  - req-answer-pages-never-overflows
  - req-autonomy-gates-every-hop
  - req-autonomy-change-applies-forward
  - req-controls-never-advance-walk
  - req-gate-needs-a-persons-verdict
  - req-pull-answers-from-record
  - req-walk-resumes-from-repo
  - req-state-opens-only-when-earned
  - req-state-needs-all-its-inputs
  - req-a-reopen-stands-where-it-can-work
  - req-land-target-routes-to-gate
  - req-instruction-names-its-source
  - req-a-pull-carrying-no-choice-enters-no-iteration
files:
  - tests/pull.test.ts
  - tests/pull-offer.test.ts
  - tests/pull-seam.test.ts
  - tests/route.test.ts
  - tests/threshold.test.ts
  - tests/boot.test.ts
  - tests/tokens.test.ts
  - tests/branching.test.ts
  - tests/feed.test.ts
  - tests/gitlane.test.ts
---

## Scope

The walk's constitution: the pull as the one advance, the slider as the
gate on every hop, the recorded position as the one truth, and the route
to a named target. The reading half is [[tsp-reading-loop]]; the claims
and drift are [[tsp-claims-and-drift]].

## Approach

Component and integration level. State-based design over the walk's own
graph: thresholds probed at the boundary (a step exactly at the slider,
one above), the wait-instead-of-throw law on every blocking shape, and
replay from files alone for the resume claims. Two claims are DEFINED
here ahead of their cases: the instruction naming its source file, and
the land-target route — both land as named cases in route.test.ts and
pull.test.ts with the build that closes them.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: a step above the slider comes back as
wait, naming the step and the person; the slider is weighed BEFORE the
reading; a recorded visit yields its state, however deep the container;
replay: parked defers and open points survive an engine life.

## Where the reopen's token set is verified

`req-a-reopen-stands-where-it-can-work` joins this spec rather than getting its
own, because its cases live in `tests/tokens.test.ts`, which this spec already
claims. The token set IS walk discipline: where the walk stands is the same
subject as whether it may advance.

FOUR STEPS, added 2026-08-13:

- reopening two steps on one chain leaves ONE token, at the upstream end.
- the frontier is the same whichever way round the reopen is asked.
- two reopened steps with no path between them keep both tokens.
- reopening a single step stands the walk in it.

WHAT MADE IT NECESSARY: re-recording an iteration's size reopened eight steps
and put a token on every one. The walk then stood in M0's kickoff gate and M3's
requirements at once - two steps on one sequential chain, which no legal
marking holds. Enforcement was never wrong; the POSITION was, and a position is
what the mirror draws and what the pull offers.

A NOTE ON THE GRAIN, worth keeping where somebody will read it. These four
cases were APPENDED to a file this spec already claimed, so a file-level sweep
for unclaimed test files would not have noticed them. That is the gap recorded
for the retro, and this paragraph is an instance of it.
