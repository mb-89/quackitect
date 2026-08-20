---
minted_in: i36
id: opt-attach-diagnosis-to-the-call-log-record
type: "[[option]]"
statement: Write the stopping-layer diagnosis onto the interrupted call's own log record, not only into the immediate response, so a later audit can find it without having been watching at the time.
cluster: cluster-the-walk
found_by: heuristic
source: "Heuristic: if it must be remembered, it must be recorded (meth-heuristics-catalog.md)."
---

## Mechanism

A diagnosis returned only in the live response is remembered by whoever was
watching at that moment and nobody else. The call log is already the
durable record of every call; a diagnosis that never reaches it is a fact
that existed for one turn and then had to be re-derived by anyone auditing
later.

WHAT SURVIVES THE TRANSFER. name-the-stopping-layer's output should land as
a field on the interrupted call's own log entry, not solely in the
conversational response.

WHAT DOES NOT. The heuristic does not say what SCHEMA that field takes on
the log record; that stays an implementation decision for whoever builds
this function.
