---
minted_in: i27-the-lane-binds-to-the-record-a-bound-wal
id: opt-the-common-path-needs-no-tree-the-rare-one-names-it
type: "[[option]]"
statement: resolve an unqualified path into the bound record without ceremony and demand an explicit tree name for anything outside it, so the common case costs nothing and the rare case cannot happen by accident
cluster: cluster-the-walk
question: how a path names its tree
found_by: heuristic
source: "the heuristic catalogue — Make the common case cheap; make the rare case possible."
---

## Mechanism

Two path forms, and which one you are using is visible in the text.

`project/...` means the bound record's tree, always, with no argument and no
thought. That is the overwhelming majority of calls.

Reaching anywhere else costs a named prefix, exactly as the two existing
doors already do: a committed `ref` for the past, `@name/rest` for a declared
root. A third form joins them for another record's tree.

WHY THE SPLIT IS THE POINT. opt-the-caller-names-the-tree makes EVERY path
carry its tree, which taxes the common case to protect the rare one.
Confinement removes the rare case entirely, which is a capability nobody
has when they legitimately need it - the retro, the overhaul, a cross-record
read.

This one keeps both and pays for neither.

THE EVIDENCE THAT THE SHAPE WORKS. `ref` and `@name` are the only parts of
path handling that have never produced a silent misroute. They are explicit,
rare, and impossible to reach by accident.

WHAT IT COSTS. A path form that is ambiguous today becomes a refusal, and
every call site that relied on the ambiguity has to say what it meant. That
is a one-time loud cost against a repeating silent one.
