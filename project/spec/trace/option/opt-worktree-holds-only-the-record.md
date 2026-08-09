---
id: opt-worktree-holds-only-the-record
type: "[[option]]"
statement: give the isolated tree only the record's own folder, and read every shared file from trunk at the moment it is needed
cluster: cluster-the-record-life
found_by: contradiction
source: "TRIZ separation IN LEVEL, via meth-triz — isolate at the part, share at the whole"
---

## Mechanism

THE CONTRADICTION. Isolating a record in its own tree keeps trunk safe from
half-finished work. It also gives the record a second copy of every shared
file, which drifts and then overwrites trunk when the record lands.

Improving is 35, Adaptability. Degrading is 33, Convenience of use — the
software reading being that two copies of one truth is what nobody can keep
straight.

THE SEPARATION IS IN LEVEL. Both demands were assumed to apply to the whole
tree. They do not. Isolation is wanted at the PART — the record's spec, its
evidence, its decisions. Sharing is wanted at the WHOLE — guidance, machines,
templates, the engine, the tests.

So the worktree contains the record's folder and nothing else, and every
shared read resolves against trunk.

WHAT IT WOULD COST HERE. SE-C-134 currently enforces the same split by
REFUSING a write, which works only while somebody is watching the clause. The
structural version cannot be forgotten, and it removes the escape-edit-return
dance the walk pays several times a day. The price is that a record can no
longer pin the method it walked, which `req-blessed-column-compiles-pinned`
demands — so the pin would have to become a ref rather than a copy.
