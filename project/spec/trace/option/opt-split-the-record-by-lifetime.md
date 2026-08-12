---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: opt-split-the-record-by-lifetime
type: "[[option]]"
statement: split the record into the part that outlives it and the part that dies with it, and give the two different homes
cluster: cluster-the-record-life
found_by: transform
source: "SIT Division, applied to the record"
---

## Mechanism

THE SUBJECT is the record, and the operator is DIVISION: split a component
and rearrange the parts.

TWO LIFETIMES ARE ALREADY MIXED IN ONE THING.

- DURABLE. The requirements, the functions, the RAID entries, the options.
  These are standing artifacts by their own templates. They outlive the
  record that wrote them and a later record may change them.
- EPHEMERAL. The evidence forms, the decision graph, the worktree, the
  position. These describe one walk and mean nothing after it closes.

The templates already say which is which, and nothing in the machinery acts
on it. Both live under the record's folder and both go into the same
worktree.

WHAT THE SPLIT BUYS. The durable half never needs isolating, because it is
the shared corpus. The ephemeral half never needs landing, because nothing
outside the record reads it. Today's whole worktree problem is these two
being carried by one mechanism.

WHAT IT COSTS. A durable artifact written DURING a record is half-made, and
the corpus would hold it before anybody blessed it. Something has to mark it
provisional, and that is a state this system does not have — green and
suspect are both about whether a claim stands, not about whether a node is
finished being written.
