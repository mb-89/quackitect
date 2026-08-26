---
form: a-reach-nobody-declared-is-refused
by: agent
signed_off: 2026-08-26T13:58:39.973Z
authors: agent
files: null
---

# Evidence form / a-reach-nobody-declared-is-refused

## current_situation

The undeclared-reach refusal stands, as `guardNoUndeclaredReach` in `deliverable/engine/doorguard.ts`.

### It refuses the addition, never the edit

The question it asks is whether THIS write turned a quiet module into one that reaches. A module that already reaches keeps being editable.

That is one read of the file on disk and one run of the predicate, and it is what lets the 82 modules reaching disk today be fixed rather than frozen.

### The refusal hands back the patch

It names the module, the door, and what that door governs. Its remedy is the exact `se_file_patch` that adds the departure line, with a placeholder where the reason goes.

The note says both ways out: route the reach through the door, or declare it with its reason.

### It states its own blind spot

The refusal quotes the door's `governs` line, which says the rule sees a module importing `node:fs` and cannot see one reaching disk through a spawned process.

A reader of the refusal therefore learns the limit at the moment they are dealing with the rule, rather than having to find it elsewhere.

### Two new clauses, and both have their page

`SE-C-149` is the undeclared reach and `SE-C-150` is the reasonless departure. The pairing rule says a clause is not done until its section stands in `guidance/refusals.md`, and both sections are written.

## built

`deliverable/engine/doorguard.ts`, 4615 bytes, holding both refusals.

`deliverable/engine/errors.ts` gains `UNDECLARED_REACH` at SE-C-149 and `DEPARTURE_WITHOUT_REASON` at SE-C-150.

`guidance/refusals.md` gains a feed-forward section for each, covering what the clause means, the ways past it, and what it cannot see.

The typechecker is clean on all six errors it carried since the test file landed. A scoped run is in flight at the time of writing and its verdict records itself.

The machine commits.

## follow_up

- The sweep is next. It asks the rule module the same questions and reports every undeclared reach across the whole tree.
- The write path wiring comes after it, and it may hold no condition of its own around either guard.
- The guard's coverage is a fraction nobody has computed. 38 of 178 modules can write through a shell, which carries no path, so the sweep is the complete check rather than a second opinion.

## anything_else

The linter flagged one parameter as unused, and the honest fix was to keep it and prefix it.

`guardDepartureHasReason` does not need a root, because it judges the content being written rather than the tree. But `deliverable/engine/files.ts:449` already calls a guard with the shape `(root, path, content, source)`, and giving the second guard a different arity would make the call site learn two shapes for one job.

So the parameter stays and reads as `_root`, which says deliberately unused rather than forgotten.
