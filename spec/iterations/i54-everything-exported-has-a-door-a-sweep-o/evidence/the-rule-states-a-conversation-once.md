---
form: the-rule-states-a-conversation-once
by: agent
signed_off: 2026-08-26T13:54:14.420Z
authors: agent
files: null
---

# Evidence form / the-rule-states-a-conversation-once

## current_situation

The rule module stands. It states the disk conversation's rule once and answers four questions about it, and it refuses nothing.

### What it answers

- Does this text hold the conversation. A predicate over one string that reads no file.
- Which governed modules hold it.
- Which are recorded as departures, with their reasons.
- Which files a person can run, counted from the tree.

### One door is registered, not four

`keeping-a-record-on-disk` is the only entry in the table. The other three conversations the neighbours walk found are a data change rather than a code change, which is the point of a table.

Registering four would put three doors in the tree with no departure list, no probe and no design behind them. The scope form names the disk door and the prototype gate logged the outward one as an open dissent.

### The name is the conversation, and the limit is stated beside it

The door's `governs` line says what it sees and what it does not: it sees a module importing `node:fs` and it cannot see one reaching disk through a spawned process, because a command carries no path to judge.

That is the prototype gate's own constraint, written into the data rather than into a comment.

### Two corrections landed with it

- The departure list is SECTIONED, one heading per door. Without that, two doors read each other's departures. The test now writes the heading.
- Every call takes a root. `deliverable/engine/widgets.ts:118-125` records what happens without one, and the fallback to the module's own directory is now the exception rather than the rule.

## built

`deliverable/engine/doors.ts`, 6364 bytes.

Exports: the `Door` type, the `DOORS` table, `door()`, `departureFile()`, `reachers()`, `departures()`, `strays()`, `entryPoints()` and `unreachedEntryPoints()`.

The typechecker went from six errors to one on this write. The one that remains is `doorguard.ts`, which is the next chunk but one.

Also patched: `deliverable/tests/doors.test.ts`, so every departure list it writes carries its door's section heading.

The machine commits.

## follow_up

- The departure list file is next and runs beside this one. It leans on nothing.
- The two refusals lean on this module and come after it. They hold no predicate of their own.
- `unreachedEntryPoints` defines reached as MENTIONED SOMEWHERE ELSE - a script, a state's exit script, or another module. An entry point nobody mentions is one nobody can run. That definition has not been probed and may be too generous; it will be judged when the sweep first reports.

## anything_else

The module reads no environment variable, which `req-no-setting-disables-every-rule-at-once` demands and a case in the test file checks by reading the module's own source.

That case is one of the two the inspection spec calls mechanical support. The other asserts that both call sites import from this module rather than restating its predicate.
