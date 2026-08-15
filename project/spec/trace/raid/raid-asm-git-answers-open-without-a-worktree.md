---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-asm-git-answers-open-without-a-worktree
type: "[[raid]]"
kind: assumption
statement: An iteration's status can be read from git cheaply enough to answer whether it is open, once per iteration, without a worktree on disk.
owner: the driving agent
trigger: the first change to the container's open test, or the first time the container takes longer than a second to draw
status: probed
impact: The whole lifecycle change rests on this. If reading status from git is slow or unreliable at the current iteration count, the folder on disk was a cache earning its keep, and the answer becomes an explicit cache with an invalidation rather than removal of the folder.
breaks_how_badly: crippling
how_likely: conceivable
probe: "holds, WITH A NAMED CONDITION on the implementation. Measured 2026-08-15 over 33 iteration branches. Today's existsSync path costs 12.6 ms. One batched git cat-file over the same 33 costs 58.7 ms, which is 4.6x the disk test and comfortably inside the one-second budget. One git show per iteration costs 1004.2 ms, which is over the budget and would therefore have to run non-blocking with progress shown. Batching removes that need entirely, so the assumption holds and the reader batches."
probed: "2026-08-15"
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - req-call-answers-in-one-second
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

TIME BOTH PATHS OVER THE SAME SET, at the real iteration count rather than a
sample. There are 27 open iterations today.

- The path in use now: `existsSync` per iteration under the worktrees folder.
- The path proposed: read each iteration's record status from its `it/<id>`
  branch, without checking out anything.

THE COMPARISON IS THE ANSWER, not an absolute number. The container already
draws inside the one-second rule with the disk test, so the question is what
the git read adds to that budget.

WHAT WOULD FALSIFY IT: the git read costing enough that the container breaches
one second at 27 iterations, or any read failing on a branch that exists.

## Result, 2026-08-15

RAN OVER THE REAL CORPUS rather than a sample. 33 iteration branches, 28
worktree folders on disk, 27 of them matching a branch by name.

| path | cost for all 33 | verdict |
| --- | --- | --- |
| existsSync per iteration, today's reader | 12.6 ms | the baseline |
| one batched git cat-file | 58.7 ms | 4.6x the baseline, inside the budget |
| one git show per iteration | 1004.2 ms | over the budget, so it would owe the non-blocking treatment |

THE ASSUMPTION HOLDS AND THE IMPLEMENTATION IS NOT FREE TO CHOOSE. Batching is
not an optimisation here. It is what keeps the container's answer inside the
budget, so listing iterations never becomes an operation that has to announce
itself and show progress.

THE ONE-SECOND RULE IS NOT A PROHIBITION, and reading it as one is what the
first version of this entry got wrong. [[req-call-answers-in-one-second]] says
it plainly: answer within a second OR return a background handle whose
completion the driver observes. Owner, 2026-08-15: operations over a second
are allowed, they must be kept few, and they must be non-blocking and
non-obtrusive, telling the person it will take a moment and showing progress
where that is possible. What is forbidden is stalling.

SO THE NAIVE READER IS NOT ILLEGAL. It is a surface that would owe a progress
treatment for a question nobody should have to wait on, which is a worse
design rather than a rule violation.

TWO CAVEATS, both carried to the build.

- THE COUNT WAS NOT THE MEASUREMENT. The batched read returned a status line
  for all 33 branches while the survey calls 27 open, because a shipped
  iteration's record on its OWN branch can still read as open. The real reader
  takes the record as it stands on trunk, and must handle a missing blob
  rather than assuming one.
- THE FIRST ATTEMPT MEASURED NOTHING, recorded because it would otherwise be
  repeated. The shell's working directory is the BOUND WORKTREE, so
  `.worktrees/<id>` is invisible from inside it and every disk test returned
  false. A baseline of failed lookups would have made the comparison
  meaningless in our own favour.

## Why it is an assumption and not a risk

WHY IT IS AN ASSUMPTION AND NOT A RISK. The change is already being designed
on top of it. Nothing waits for the probe to start, which is exactly the
condition that makes something an assumption rather than a worry.

WHERE IT CAME FROM. Named as the kill-criterion at i28's kickoff gate, round
2, on 2026-08-15.
