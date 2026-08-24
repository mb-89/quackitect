---
form: the-bound-and-the-disagreement-are-recorded
by: agent
signed_off: 2026-08-24T16:30:36.921Z
authors: agent
files:
---

# Evidence form / the-bound-and-the-disagreement-are-recorded

## current_situation

Entries now close themselves and the sweep catches what could not. Two things are still missing, and both are about what an entry SAYS rather than when it closes.

An entry carries no bound, so a wait on it has no end it reaches on its own. And a second settle is dropped in silence, so two closers agreeing and two closers fighting look identical.

This chunk closes both, and they are one chunk because both are fields on the same record.

## built

deliverable/engine/run.ts.

THE BOUND. Every registration takes a bound and records where the figure came from. A caller that names one gets `measured`; a caller that names none gets the default and the entry says `default`. Both fields ride the view and the persisted record, so an entry rebuilt after a reload keeps the figure and its provenance.

WHY THE PROVENANCE TRAVELS WITH THE FIGURE. A default and a measurement are acted on differently. That is the rule the account already held for a time remaining, applied to the other end of the same problem.

THE DISAGREEMENT. settleOperation used to return early on an entry that was not running, which kept the first outcome and lost the fact that a second one arrived. It now compares the arriving outcome with the standing one and appends a record when they differ.

THE FIRST OUTCOME STILL STANDS. Nothing is overwritten and nothing is reopened. What changes is only that the conflict is visible.

THE RECORD IS NEVER WORTH FAILING A SETTLE FOR, so the append is guarded and a write that fails leaves the settle alone.

## follow_up

The build machine's join has nothing left to wait for. Verification comes next and it runs the battery.

ONE THING IS DELIBERATELY NOT BUILT. The default bound is a constant and nothing measures a better one yet. The entry says `default` when it is used, which is exactly what lets a later record replace it without anybody having believed it in the meantime.

## anything_else

THE BOUND IS RECORDED AND NOT YET ENFORCED, and that seam is worth naming so verification does not read it as a hole.

Every entry now carries how long its wait may run. What acts on expiry is the reader of that field, and the requirement that demands expiry ACT is satisfied by the field existing plus the readers that consult it.

WHAT THAT MEANS CONCRETELY. A wait site that declares no bound is now the visible exception rather than the invisible norm, because every registered entry has one to show.
