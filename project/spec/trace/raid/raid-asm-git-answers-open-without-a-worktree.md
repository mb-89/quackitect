---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-asm-git-answers-open-without-a-worktree
type: "[[raid]]"
kind: assumption
statement: An iteration's status can be read from git cheaply enough to answer whether it is open, once per iteration, without a worktree on disk.
owner: the driving agent
trigger: the first change to the container's open test, or the first time the container takes longer than a second to draw
status: open
impact: The whole lifecycle change rests on this. If reading status from git is slow or unreliable at the current iteration count, the folder on disk was a cache earning its keep, and the answer becomes an explicit cache with an invalidation rather than removal of the folder.
breaks_how_badly: crippling
how_likely: conceivable
probe: <!-- what the check found. Start with holds, false, unprobed or scheduled. -->
probed: <!-- the date the check ran, as YYYY-MM-DD -->
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

WHY IT IS AN ASSUMPTION AND NOT A RISK. The change is already being designed
on top of it. Nothing waits for the probe to start, which is exactly the
condition that makes something an assumption rather than a worry.

WHERE IT CAME FROM. Named as the kill-criterion at i28's kickoff gate, round
2, on 2026-08-15.
