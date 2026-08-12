---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: opt-one-store-for-what-happened
type: "[[option]]"
statement: keep one append-only store of what happened, and derive the log view, the trace view and the inbox count from it
cluster: cluster-the-account
found_by: heuristic
source: "heuristic — one source of truth; everything else derives"
---

## Mechanism

THE RULE BIT IN THREE PLACES, and each one has a requirement written to keep
two copies in step.

- The call log and the note inbox are separate stores.
  `req-drained-note-leaves-count` exists so their counts agree.
- The trace graph is derived from files, and the log is not.
  `req-trace-view-derived-from-files` exists so the view cannot drift.
- The record's worktree and trunk hold two copies of every shared file, and
  SE-C-134 exists to stop them diverging.

WHAT THE OPTION IS. One append-only store of acts. Everything a reader wants
is a query over it: the feed, the trace, the pending count, the drift report.

WHAT IT WOULD BUY. Every requirement above stops being needed, because there
is nothing to keep in step. A rule that exists only to reconcile two copies
is a rule the design created.

WHAT IT COSTS, and this is the objection that has to be answered. A derived
count is a computation, and this project rules against treating a derived
value as truth — `recordDone` recomputes green on every look precisely
because a stored derived value went stale. So the store must be cheap enough
to query on every look, or the rule it obeys is the one it broke.
