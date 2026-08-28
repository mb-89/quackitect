---
id: wt-four-verbs-can-write-and-only-one-asks-whether-the-result-wi
type: "[[work]]"
statement: "Four verbs can write, and only one asks whether the result will still load. The check that reads a node's header lives in the whole-file writer alone. Three siblings — the patcher, the replacer and the mover — share a common gate that never calls it, so each can leave a file the engine's own reader rejects. Proven by doing it: a value with a colon in it landed cleanly, and the next walk step died on a bare parser message naming a line and a column with no clause and nothing to act on. The gate's own comment already forbids exactly this arrangement. Care is needed because the check answers two ways, throwing at a fresh break and reporting an old one, and a careless move loses that distinction."
ready_when: ready when an engine round takes the write guards, or sooner since the change is one call site
source: note-74b1e5aaa3db
---

## Why it stands

Four verbs can write, and only one asks whether the result will still load. The check that reads a node's header lives in the whole-file writer alone. Three siblings — the patcher, the replacer and the mover — share a common gate that never calls it, so each can leave a file the engine's own reader rejects. Proven by doing it: a value with a colon in it landed cleanly, and the next walk step died on a bare parser message naming a line and a column with no clause and nothing to act on. The gate's own comment already forbids exactly this arrangement. Care is needed because the check answers two ways, throwing at a fresh break and reporting an old one, and a careless move loses that distinction.

## When it comes back

ready when an engine round takes the write guards, or sooner since the change is one call site
