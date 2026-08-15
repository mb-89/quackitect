---
form: container-choose
by: agent
signed_off: 2026-08-15T11:28:03.893Z
authors: agent
files:
---

# Evidence form / container-choose

## current_situation

A bare pull at the container's start walked into whichever iteration happened to be first, and entering one BINDS it.

So the walk took a decision that is the walker's, and did not say so. Worse, there is no drawn way back: on 2026-08-15 reaching a sibling from inside one drew fifteen hops through two unrelated iterations, and the only way out was an escape to the front desk. In an unattended run that is a dead stop.

## built

Committed in 63cc0eda. Two changes, and the second was found by the first not being enough.

- engine/iterations.ts collects the container's dependency-free roots and wires them with role ALTERNATIVE when more than one stands open. Alternative already means OR here, so the sweep stops at the branch instead of walking through it. With one root the edge stays normal, because entering the only thing open is not a choice.
- engine/session.ts puts the options on a `do` answer wherever the walk stands at a branch. The container then stopped correctly and offered nothing, which is half a fix: `do` means the happy path ran up TO the next branch, and the walker still has to be told what the branch is.

Covered by tests/containerchoice.test.ts, green at 2 of 2: one open iteration is walked into, two are offered while the walk stays at the container's own start.

Battery green at 1312 of 1312, so the walk's core change breaks nothing.

## follow_up

- note-bb1e9e0a5028 records what this chunk turned up: pull: "choose" exists nowhere in the engine. The contract and the tool description both name five instructions and the code emits four.
- The requirement said the container shall offer them AS A CHOICE, and the offer arrives as options on a `do` rather than as a `choose`. The demand is met and the WORD is not, which is the note's subject rather than this chunk's.
- The expeditions container has the same shape and was left alone. It has not been seen doing this, and its generator is a separate function.

## anything_else

ON A FIX THAT NEEDED A SECOND HALF.

The first change alone was greenable and wrong. The container stopped at its own start rather than entering a record, which is exactly what the requirement's first clause asks.

And the answer said `do` with no options at all. So the walker learned only that it was somewhere, with no way to find out what the doors were except to guess one and read the refusal.

That is the trap this record has hit twice now in different clothes: a change that satisfies the letter of a demand while leaving the person or agent with nothing they can act on. The timings fix had the same shape, where attaching the reporter without telling it where to write would have changed nothing observable.

BOTH HALVES CAME FROM RUNNING THE THING, not from reading it. The first was found by a test asserting the wrong shape, and the second by reading what the test actually got back.
