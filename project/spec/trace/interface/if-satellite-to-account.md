---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: if-satellite-to-account
type: "[[interface]]"
statement: Every call a satellite serves and every claim it stamps is logged with the record it belongs to.
source: el-satellite
destination: el-account
carries:
  - flow-dispatched-call
  - flow-stamped-claim
form: append
source_refs:
  - decompose-structure, the element matrix's owed cell
  - req-every-call-logged
  - req-audit-answers-from-log
---

Append-only, and the record id is not optional. With one process the log was
implicitly about one walk. With N satellites it is about N, and an entry that
does not say whose it is cannot be read back.

## What crosses

The call as it was made, the claim as it was stamped, and the
record that owns both.

## Why it does not go through the core

The log is machine-wide and the core
owns it, but a satellite appends directly rather than routing, because a log
that depends on the core being reachable loses exactly the entries written
when something is wrong.

## Ordering across satellites

Not guaranteed, and it does not need to be. Each
entry carries its own timestamp and record; a reader who wants one walk
filters by record and gets a total order within it.
