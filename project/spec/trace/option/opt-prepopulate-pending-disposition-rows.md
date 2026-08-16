---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-prepopulate-pending-disposition-rows
type: "[[option]]"
statement: write one disposition row per ranked candidate up front, stamped pending, so an undisposed candidate is a visibly incomplete record rather than an absent one
cluster: cluster-the-disposition
found_by: heuristic
source: "meth-heuristics-catalog: \"Make the illegal unrepresentable, not merely checked.\" and \"The default should be the safe thing\" — both bite the same mechanism"
---

## Mechanism

record-a-coupling-disposition's own Rationale already names a
forced-disposition guarantee. This option is the concrete mechanism for it:
the moment rank-candidate-couplings returns, every candidate gets a
disposition row stamped `pending`, before any person looks at it.

An undisposed candidate is then a row reading `pending`, not a missing row
— checkable by anyone reading the record, not just by code that remembers
to check. The unsafe default (silently treating an unreviewed candidate as
"not coupled") becomes structurally impossible rather than merely avoided
by discipline.
