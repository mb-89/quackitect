---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-thin-tree-reads-shared-from-trunk
type: "[[option]]"
statement: keep only the record's own folder in its tree and read shared content from trunk at the moment it is needed, so there is no shared file in the tree to overwrite
cluster: cluster-the-walk
question: how shared method reaches a tree
found_by: prior-art
source: "raid-dec-thin-tree, minted i1, status decided; measured 2026-08-10 as exp-trunk-read-cost"
---

## Mechanism

The tree holds the record and nothing else. A shared read goes to trunk
through a long-lived batch reader.

SE-C-134 stops being a rule an agent must remember and becomes a fact about
the filesystem: there is no method file in the tree to overwrite.

THE READ HALF IS MEASURED, which is rare for an option at this stage. 2.0 ms
per file through one long-lived git batch reader, against 0.5 ms plain disk.

THE MEASUREMENT ALSO NAMES THE SHAPE THAT FAILS. A git process spawned per
read costs 47 to 54 ms, and the bet does not hold there. So the option is
the batch reader specifically, not trunk reads in general.

WHAT IT DOES NOT SETTLE. The moving-trunk half - whether a walk survives the
method changing under it - is this iteration's own open question, and the
decision's own body says so.
