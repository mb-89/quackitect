---
minted_in: i36
id: opt-migrate-test-records-at-write-time
type: "[[option]]"
statement: Upgrade an old test-record's shape once, at the moment it is next written, instead of teaching every reader to tolerate every historical shape forever.
cluster: cluster-the-record-life
found_by: transform
source: "SCAMPER Substitute, held against tolerate-old-test-records (meth-scamper.md)."
---

## Mechanism

Tolerant reading keeps every historical shape alive in every reader,
forever. Substituting a write-time migration converts an old record to the
current shape the first time anything touches it, so readers only ever
handle one shape after the migration has run once per record.

WHAT SURVIVES THE TRANSFER. The record only needs to look old until it is
next written; after that, boot's own reading gets simpler over time instead
of accumulating cases.

WHAT DOES NOT. A record nobody ever writes again stays old forever, so a
write-time migration alone does not close the gap for records that are
read-only from here on. Tolerant reading and write-time migration are not
mutually exclusive; a full solution likely wants both.
