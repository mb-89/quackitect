---
minted_in: i2
id: el-claim-ledger
type: "[[element]]"
statement: Marks whose piece is whose — one add-only claim file per iteration on the claims branch, opened by its own first claim, pushed at claim time, recorded locally when offline, released only by a person's recorded force.
kind: planned
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.share-the-pool
source_refs:
  - cand-claims-branch
  - raid-dec-claim-rides-the-claims-branch
---

The winner's claim mechanism as one element. Claiming writes
claims/<iteration>.md (minted machine id, UTC time) on the claims branch
and pushes in the same act; the remote's push acceptance is the lock, and
a rejected push is a lost race handled by re-fetch and re-pick. Offline,
the claim records locally and announces when the remote returns. Release
is a person's force commit recording who and why — never an everyday
control.

Boundary: the interfaces the element matrix mints for its flows — the
record store opens a record only over a standing claim.

Realization: git supplies the branch, the push semantics and the history;
the claim verb and the reconcile are ours.

The ledger OPENS ITSELF (2026-08-13). A product whose claims branch does
not exist yet gets it minted by the first claim, so no product needs an
opening act somebody has to remember.
