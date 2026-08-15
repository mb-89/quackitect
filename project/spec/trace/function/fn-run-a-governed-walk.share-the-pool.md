---
minted_in: i2-parallel-iterations-across-machines-seed
id: fn-run-a-governed-walk.share-the-pool
type: "[[function]]"
cluster: the-record-life
statement: share the pool of seeded work across machines, so each takes its own piece and none takes another's
satisfies:
  - req-seed-lands-on-remote
  - req-claim-is-one-pushed-file
  - req-claim-race-first-push-wins
  - req-claim-wears-its-age
  - req-offline-claim-reconciles
  - req-force-release-recorded
  - req-machine-id-anonymous
  - req-engine-pushes-only-machinery
  - req-pool-opens-on-first-claim
  - req-absent-ledger-is-not-offline
inputs:
  - flow-repository
outputs:
  - flow-open-record
controls:
  - the remote's push order, which is the only arbiter of a race
  - the person's judgment, which is the only thing that releases a claim
source_refs:
  - uc-claim-an-iteration
---

## Rationale

The pool is what turns one product into parallel work: seeds visible to
every machine, one small claim marking whose piece is whose, and the
remote - not a coordinator - deciding every race. Solution-neutral on
purpose: nothing here names branches or files; that is M4's to choose.
The two controls carry the owner's rulings - the race is the lock, and
abandonment is judged by a person, never by a timeout.
