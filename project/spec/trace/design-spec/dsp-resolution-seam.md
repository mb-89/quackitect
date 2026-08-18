---
minted_in: i27
id: dsp-resolution-seam
type: "[[design-spec]]"
statement: one resolver every verb calls, which decides the store, refuses what falls outside the record, and returns the store beside the path
realizes:
  - "el-resolution-seam"
  - "if-satellite-to-resolution-seam"
  - "if-walk-engine-to-resolution-seam"
  - "if-satellite-supervisor-to-resolution-seam"
  - "if-resolution-seam-to-engine-delta"
  - "if-resolution-seam-to-method-compiler"
  - "if-record-store-to-resolution-seam"
  - "if-resolution-seam-to-account"
files:
  - "project/deliverable/engine/paths.ts"
  - "project/deliverable/engine/resolve.ts"
  - "project/deliverable/engine/actbound.ts"
  - "project/deliverable/engine/files.ts"
  - "project/deliverable/engine/run.ts"
  - "project/deliverable/engine/lint.ts"
  - "project/deliverable/engine/tools.ts"
---

## Responsibility

Every path a caller names is turned into a store and an absolute path, in one
place, and the answer carries both.

WHAT IT DOES NOT DO. Routing. A path resolving outside its record is refused
here; a call naming a different OWNER is handed up, and that is
[[dsp-core-and-satellite]]'s.

## Interface

`resolve(call) -> { store, abs } | Rejection`

The store is the thing that changes today. `resolveInRoot` returns a bare
string, so a caller cannot tell which tree answered.

- IN: the path, the verb, and the record the caller is bound to.
- OUT: the resolved store and the absolute path, together.
- REFUSED: anything resolving outside that record, with the clause and the
  remedy the lane already carries.

## Behavior and constraints

THE SEAM IS NOT OPTIONAL FOR ANY VERB. `exp-one-seam` counted 40 resolver
call sites against 88 paths built with a direct join. The dispatch layer is
nearly clean at 7 against 1; the work is in modules that read the filesystem
for themselves.

`lint.ts` IS THE WORKED EXAMPLE and it is on this spec's file list for that
reason. It imports `readFileSync` and `join` from node and calls no resolver,
which is why it answered against a different tree than the file lane on
2026-08-14.

THE SHELL NEEDS NO RULE. `exp-one-seam` measured a child inheriting its
parent's working directory. `run.ts` is on the list to keep it that way, not
to add a guard.

THE PLATFORM REFUSES NOTHING. The same probe resolved a path four levels out
to a folder outside the project, cleanly. So the refuse step is load-bearing
rather than defensive.

A WRITE IS PROVED BY READING BACK from the store the answer named, never by
the call's own verdict. [[tsp-read-back-inspection]] is the check.

## Rationale

ONE SEAM RATHER THAN A RULE PER TOOL, per
[[opt-one-resolution-seam-not-a-rule-per-tool]]. The i8 field report of
2026-08-12 records a guard covering five write verbs and not the shell, which
is what a rule per tool decays into.

THE STORE ON THE ANSWER is what [[raid-risk-a-write-lands-in-the-wrong-tree-silently]]
asks for. That entry is an ISSUE rather than a risk: it happened twice on one
day, with the paths recorded.
