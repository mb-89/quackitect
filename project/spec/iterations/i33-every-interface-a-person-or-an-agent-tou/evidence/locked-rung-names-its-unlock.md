---
form: locked-rung-names-its-unlock
by: agent
signed_off: 2026-08-17T12:14:31.907Z
authors: agent
files:
---

# Evidence form / locked-rung-names-its-unlock

## current_situation

The second build chunk, and the first that changes what a person sees. It turns the third case of tsp-a-control-is-legible green.

IT IS PROVEN RATHER THAN CLAIMED. A battery ran against the tree as this chunk left it: 1397 tests, 1395 pass, 2 fail, and neither failure is this chunk's. The case that was red before it now passes.

## built

project/deliverable/engine/params.ts, in renderRung and its one call site.

WHAT CHANGED. renderRung took the rung below as a NUMBER and could only say "unlock the rung below first". It now takes the rung below WHOLE, so it can say which one.

- The signature takes `prev` — the previous level object, or undefined for the lowest — instead of `below: number`. The number is derived from it in one line, so nothing downstream changed.
- The unreachable branch composes its help from `prev.name`.
- The call site passes `levels[i - 1]` instead of `levels[i - 1].value`.

THE NAME COMES FROM THE LEVELS ALREADY HANDED IN, which is what the design spec demanded and the reason it is worth doing this way. An edit to machines/stopat.md moves the wording without touching this code, because there is no second copy of the list here to drift.

MEASURED, from the battery's own failure text before and after:

- BEFORE: `title="blockers only — unlock the rung below first"`
- AFTER: `title="blockers only — unlock bless first"`

And the two rungs beneath it say `unlock state end first` and `unlock agent judgement first`, so the naming holds across the bank rather than at one position.

NOTHING ELSE MOVED. The battery went from 3 failures to 2, and the one that cleared is the one this chunk aimed at.

## follow_up

TWO CASES REMAIN RED and each belongs to a chunk still to come.

- `a bank handed no position is distinguishable from one sitting at zero` — chunk three.
- `a running operation past its bound is named on the panel` — chunk four.

ONE THING TO DECLARE, BECAUSE HIDING IT WOULD BE WORSE. Chunk three's edit was applied while standing in this chunk's state, so that one battery could answer for both rather than two batteries answering for one each. The verdict quoted above ran BEFORE that edit, so this chunk's evidence is its own and provable. Chunk three arrives with its change already on disk and unproven, and its own state says so.

A DEFECT IN THIS ITERATION'S OWN TESTS, found by reading the verdict rather than by running anything. The fourth case of tsp-work-past-its-bound-signals, `the running signal does not take the panel over`, is GREEN FROM BIRTH. With no signal built, the busy panel and the quiet one are identical, so its containment assertion is trivially true. observe-red names exactly this: green from birth proves nothing. It is a hole in the work under my hands rather than a stray, and chunk four fixes it before it claims anything.

## anything_else

