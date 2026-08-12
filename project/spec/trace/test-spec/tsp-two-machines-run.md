---
minted_in: i2-parallel-iterations-across-machines-seed
id: tsp-two-machines-run
type: "[[test-spec]]"
statement: Two machines share one remote - the seed lands there at once, entry claims it, a second machine sees the holder and is refused the same claim, verified by demonstration in a two-clone lab.
method: "demonstration"
verifies:
  - "none — demonstrates: sty-work-on-two-machines carries the edge; the mechanics are test-verified by tsp-claim-lane and tsp-claim-guardrails"
demonstrates:
  - "sty-work-on-two-machines"
files:
  - "none — the procedure below is the definition; the observed lab run is the evidence"
---

## Scope

The mechanics are test-verified by [[tsp-claim-lane]] and
[[tsp-claim-guardrails]]. THIS spec demonstrates the story's shipped
slice end to end, and `demonstrates:` is its upward edge.

The slice: seed, announce, claim, holder named across machines. The
both-machines-ship arc stays owed to a real second machine - the story
deck names which slides stand and which are owed.

## Approach

System level, in a lab: one bare remote, two clones, each clone its own
machine identity. Driven by an observer that did not build the lane.

## Procedure

- Seed an iteration in clone one. Observe: the seed answers announced,
  and the remote lists the iteration's branch at once.
- List from clone two. Observe: the seed stands unclaimed, read off the
  remote alone.
- Enter the iteration from clone two. Observe: the entry claims it in
  one push; the claim file carries clone two's machine id and the time.
- List from clone one. Observe: the listing names the holder and its
  age.
- Enter the same iteration from clone one. Observe: the entry refuses,
  naming the holder.
- Race two claims where both machines push at once. Observe: the remote
  accepts one; the loser is refused and rebuilds.

## Observed

2026-08-12, the fresh-eyes lab run (the run log rides job-msq7b2bq-3):
every step above observed as written. Machine ids 1e77e2bf and 1f263c7e;
one add-only claim file on the remote's claims branch.
