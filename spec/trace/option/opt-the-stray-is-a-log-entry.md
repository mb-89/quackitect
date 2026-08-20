---
minted_in: i1
id: opt-the-stray-is-a-log-entry
type: "[[option]]"
statement: delete the note store and let a stray be a log entry of its own kind, with pending computed as a query rather than kept as a state
cluster: cluster-the-holding-pen
found_by: without
source: trimming per meth-trimming — the account absorbs the job
---

## Mechanism

THE TRIM. What if holding a stray is not its own function?

WHO DOES ITS JOB. The account. Every call is logged already. A stray becomes
a log entry of kind `note`, a drain becomes a log entry of kind `drain`
naming it, and PENDING is the difference between the two — a query, not a
stored state.

WHAT IT WOULD BUY. One store disappears, and with it the whole class of bug
where the inbox count and the drain log disagree. `req-drained-note-leaves-count`
and `req-unknown-drain-ref-refused` both exist to keep two records in step,
and neither is needed when there is one record.

WHAT IS LOST, and it is the reason the function was split out in the first
place. A pending note CHANGES THE WALK'S OBLIGATIONS: it holds the next
kickoff shut. Nothing else in the log does that. A computed query can still
answer the gate, so the loss is not the capability — it is that an obligation
would now depend on a derived value, and this project rules against deriving
what it then treats as truth.

THE TENSION IS REAL AND UNRESOLVED HERE. The account's own rationale says
nothing in it decides anything. This trim would give it something that does.
