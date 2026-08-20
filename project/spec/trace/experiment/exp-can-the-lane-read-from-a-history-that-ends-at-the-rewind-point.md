---
minted_in: i37-training-iterations-a-disposable-iterati
id: exp-can-the-lane-read-from-a-history-that-ends-at-the-rewind-point
type: "[[experiment]]"
statement: "Can a working tree be stood up whose git history ENDS at the rewind commit, so a request for a later commit cannot be formed rather than being refused?"
probes:
  - raid-risk-the-git-ceiling-fails-open-and-a-run-reads-the-answers
  - raid-ar-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
timebox: "minutes — two git commands, abandon if it needs a server config change"
form: script
faked: "the lane itself. The tree was built and interrogated with git directly; no se_ verb was pointed at it, because reaching another tree needs a declared root and that is the owner's act."
fallback: "pre-agreed before the run: if a truncated history could not be built without changing server configuration, the checked ceiling stands and the declaration at declare-winner needs no revisiting."
folds_to: "declare-winner — the structural ceiling is available on probed ground and the override falls"
promote: "name the rewind commit as a ref, then fetch it at depth 1"
verdict: holds
source_refs:
  - cand-the-guarded-run
  - cand-the-refusing-run-with-recorded-conditions
  - raid-dec-the-ceiling-is-an-ancestry-test-not-a-path-mask
chunk: stand-the-rewound-tree
---

## The run

RUN 2026-08-19, timeboxed at minutes. Two routes were tried.

### Route one failed, and the failure is the useful half

    git fetch --depth 1 <source> 20abd831

`fatal: couldn't find remote ref 20abd831`. A bare object id is not fetchable
unless the source sets `uploadpack.allowAnySHA1InWant`, which it does not.

SO A BENCHMARK CANNOT FETCH A REWIND COMMIT BY ID. It has to be named first.

### Route two holds

    git update-ref refs/bench/<id> <rewind-commit>
    git fetch --depth 1 <source> refs/bench/<id>:refs/heads/bench

MEASURED, on i33's rewind point `20abd831`:

| what was asked | answer |
| --- | --- |
| HEAD | `20abd83` — the rewind point exactly |
| history depth | **1** |
| working tree | **1723 files** |
| `git rev-parse 5f85977f` (i33's own start) | **does not resolve** |
| `git grep -l i33 -- project/spec/trace` | **0 files** |
| control: `git grep -l i15` at the same tree | **71 files** |

THE CONTROL IS THE POINT OF THE FOURTH AND FIFTH ROWS. A zero from a search
that cannot run looks exactly like a zero from a search that ran. 71 says the
search ran.

## What it settles

THE STRUCTURAL CEILING IS BUILDABLE, cheaply, with two commands and no server
configuration.

IT IS BETTER THAN THE EXPORT, and that was not expected. `git archive` gives
content with no history at all, so `se_git log`, `show` and `diff` are dead
inside it. A depth-1 fetch gives a full working tree AND a usable history that
simply ENDS at the rewind point.

SO THE FUTURE IS NOT REFUSED. IT IS ABSENT. `5f85977f` does not resolve because
the object is not there, which is what `make the illegal unrepresentable`
asked for and what a checked ceiling can only approximate.

## What it does not settle

- Whether the LANE can read from such a tree. Reaching another tree needs a
  declared root, which is the owner's act (SE-C-127). This spike interrogated
  the tree with git directly.
- Whether the current engine RUNS against it. That is the fourth spike.

## What it overturns

BOTH BLESSED GATES RECORDED THIS DISSENT IN ADVANCE. gate-candidates and
gate-architecture each said: if the M6 spike shows the lane can read from a
truncated history, `cand-the-guarded-run`'s ceiling becomes available on probed
ground and the ruling should be revisited at its own escalation.

THE SPIKE HOLDS. The fold-back owes that revisit.
