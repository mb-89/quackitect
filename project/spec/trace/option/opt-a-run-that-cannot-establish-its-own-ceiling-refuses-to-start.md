---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-a-run-that-cannot-establish-its-own-ceiling-refuses-to-start
type: "[[option]]"
found_by: heuristic
statement: "The safe outcome is the default at every point where the guard cannot answer, including before the run begins rather than only during it."
source: "HEURISTIC \u2014 the default should be the safe thing"
---

## What it adds to what is already ruled

The register already has the ceiling failing closed per request. This pushes the
same default one step earlier: a run whose rewind point cannot be resolved, or
whose ancestry test cannot be exercised, never binds at all.

## Why the earlier point is the better one

A run that starts and then refuses everything produces a report full of
refusals that looks like a machine failure. A run that never starts produces
one refusal naming one cause.

## Mechanism

The binding act tests its own guard before it opens, and refuses to bind if the
test cannot be run.
