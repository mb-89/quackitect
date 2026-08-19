---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-a-reachable-future-commit-is-made-unrepresentable-rather-than-checked
type: "[[option]]"
found_by: heuristic
statement: "The past state is served from a source that has no future in it, so a request for a newer commit cannot be formed rather than being formed and refused."
source: "HEURISTIC \u2014 make the illegal unrepresentable, not merely checked"
---

## What it changes

The ceiling stops being a test on every request and becomes a property of what
the run can see at all.

## Why it matters more here than usual

A checked rule fails open when the check errors, and a guard going quiet looks
exactly like a guard passing. That is the fatal risk on the register. A rule
that cannot be expressed cannot fail quietly.

## What it costs

Materialising a history that genuinely ends at the rewind point is more work
than testing ancestry per call, and it may not be reachable at all through the
lane's existing verbs.

## Mechanism

The bound run reads from a source whose newest commit IS the rewind point,
rather than from the full clone with a test in front of it.
