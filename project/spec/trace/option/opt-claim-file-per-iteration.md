---
minted_in: i2
id: opt-claim-file-per-iteration
type: "[[option]]"
statement: the claim is one small add-only file per iteration on a dedicated claims branch, and the remote's push acceptance is the lock
cluster: cluster-the-record-life
question: what serializes a claim
found_by: prior-art
source: Git's own push semantics - atomic ref update, non-fast-forward rejection; the lease-branch pattern CI fleets use for distributed locks
---

## Mechanism

Claiming writes claims/<iteration>.md (machine id, UTC time) on the
claims branch and pushes. The remote accepts exactly one push per ref
update; a loser rejects non-fast-forward, re-fetches, sees the claim,
picks another. Add-only files never merge-conflict. Release is a second
commit by a person's force act - the history keeps who held what.

WHAT IT COSTS HERE: one extra branch to fetch, and a claims history
that grows forever - both cheap. Readable in any git UI, which the
refs-namespace alternative is not.
