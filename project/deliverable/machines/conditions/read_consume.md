---
condition: read_consume
---

# read_consume — read once, then destroyed

Arguments: documents that must be READ before the state is left, and that
are DELETED as it is left.

A listed path that is not there demands nothing. So a state may name a
document that is only sometimes present, and an install that never had one
walks straight through.

The proof is the same as [[read]] — the agent sends the hash, the human
checks the box. Nothing differs there.

## Why it is destroyed

A document that survives its own reading gets believed a second time, by
somebody who was not there when it was written.

The session handover is the case this exists for (owner ruling
2026-07-31). Two sessions in a row built on claims that had stopped being
true. One of them would have installed a broken extension. The written
rule said to check every claim first, and that rule did not hold, because
prose rules do not hold.

So the file cannot outlive its own reading. That is a mechanism, not a
discipline.

## What it costs

Everything in a consumed document is GONE once the state is left. Nothing
in it is a store, and nothing in it is a record.

Anything that must outlive the session gets carried out FIRST, into
something the machine reads again:

- a fact about the project — guidance, or the record
- a job somebody must still do — a note, or a parked to-do
- a caution worth keeping — checked first, then written where it belongs

A state that consumes a document says so in its own guidance, and carries
the tools needed to do that carrying.
