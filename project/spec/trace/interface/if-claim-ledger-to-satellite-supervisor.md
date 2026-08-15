---
minted_in: i27
id: if-claim-ledger-to-satellite-supervisor
type: "[[interface]]"
statement: A satellite is started only for a record this machine holds the claim on, so no two machines can serve the same record at once.
source: el-claim-ledger
destination: el-satellite-supervisor
carries:
  - flow-open-record
form: call
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-claim-race-first-push-wins
---

The claim is the permission to start. Asking for it is the first thing
the supervisor does.

## No claim, no satellite

A record held elsewhere gets a refusal naming the
holder, not a second process quietly serving the same work.

## Why this crossing exists now and not before

With one engine, holding a claim
and serving a record were the same act by construction. With a supervisor
that can start many, the check has to be explicit or the machinery would
happily start a satellite for a record another machine is walking.

## When the claim is released

When the record closes, after the reap, on the same
ordering the store's release follows.
