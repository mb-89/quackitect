---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: raid-iss-an-absolute-canvas-reference-is-resolved-with-no-containment-check
type: "[[raid]]"
kind: issue
statement: A machine drawing that names an absolute path gets it back unchecked, so a canvas can point the compiler at any file on the machine.
owner: the maintainer
trigger: any change to how a drawing names the notes it points at, and the next record that touches the compiler
status: open
breaks_how_badly: crippling
how_likely: conceivable
impact: A drawing is a file a person edits in Obsidian, so the path comes from outside the lane. Nothing in the resolver stops it leaving the project.
weighs_with: none
weighs_against: none
place: i40-every-write-path-is-guarded-the-pool-s-b
---

## What is wrong

`deliverable/engine/machines/compile.ts` line 63 reads `if (isAbsolute(ref)) return ref;`
and returns. Every other branch resolves against the project root or the canvas
directory; this one does not resolve at all.

The path jail exists for exactly this, and now exports one predicate for it:
`isInside` in `deliverable/engine/paths.ts`.

## Why it was not fixed with its four siblings

It is not a copy of the predicate. The other four sites each held a containment
check, right or wrong, and all four now ask the one predicate. This site holds
NO check, so closing it is a behaviour change rather than a de-duplication.

WHAT IT WOULD CHANGE is what a drawing may point at. Any canvas relying on an
absolute reference stops compiling, and the compiler that would break is the one
that compiles the machine being walked.

THE ENGINE CACHES MODULES, so a change here could not be exercised in the
session that made it without a reload, and a reload reboots the walk.

## The repayment

Establish first whether any drawing in the corpus uses an absolute reference. If
none does, the branch is dead and deleting it costs nothing. If one does, the
question is what it was for, and that is a design answer rather than a patch.
