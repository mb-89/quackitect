---
minted_in: i37-training-iterations-a-disposable-iterati
id: el-benchmark-guard
type: "[[element]]"
statement: "Refuses what a bound run must not see: any commit or ref that is not an ancestor of the rewind point, and the benchmark history for as long as the run stands."
kind: new
realization: make
group: the-benchmark-run
implements:
  - fn-the-benchmark-run.refuse-what-the-rewind-point-cannot-reach
  - fn-the-benchmark-run.conceal-the-benchmark-history-for-the-length-of-a-run
source_refs:
  - raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - req-the-benchmark-history-is-unreadable-while-a-run-is-bound
---

Two refusals with one owner, because both are properties of the binding rather
than of a path.

## The ceiling

A commit or ref that is not an ancestor of the rewind point does not resolve
([[raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask]]).

IT RESTS ON ONE PRIMITIVE THAT THE LANE CANNOT REACH TODAY. `merge-base` is
not on `se_git`'s allowlist. Either the list grows by one entry, or the
ancestry answer is derived from `log` or `rev-parse`.

## The concealment

`project/spec/benchmarks` is invisible while a run is bound and visible
everywhere else, so a run cannot read the previous run's numbers and work
toward them.

IT INHERITS A KNOWN WEAKNESS. Three exclusion lists decide what a lane verb may
see, they disagree, and the reading verb consults none of them. That is
`wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-`, and this
element is why the token is a dependency rather than a neighbour.

## The proof it carries

One deliberately forbidden request per run, its refusal recorded. A run whose
forbidden request succeeded is discarded rather than reported. A guard nobody
exercised is indistinguishable from a guard that is not there.
