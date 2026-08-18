---
form: coverage-computes-both-sides
by: agent
signed_off: 2026-08-16T17:28:14.777Z
authors: agent
files: null
---

# Evidence form / coverage-computes-both-sides

## current_situation

THE CHECK NOW READS BOTH SETS FROM THE CORPUS. One line changed in `coverProblems`, and the defect I hit four times on this walk is closed.

THE FIELD STILL EXISTS and asks a different question: which nodes THIS delta touched. The corpus answers which exist; only the author knows which the record moved.

THE RUN IS OWED with the other three, waiting on the same reload.

## built

### The one line

BEFORE:

    for (const r of refs) for (const p of byId.get(r)?.refines ?? []) served.add(p);

AFTER:

    for (const n of corpus) for (const p of n.refines) served.add(p);

`refs` IS THE AGENT'S LISTING. `corpus` is what is on disk. That substitution is the whole fix.

### What did NOT change, and why each matters

THE LISTED SIDE IS STILL CHECKED. A node the author names that refines nothing of the covered type is a fact about THEIR work, not about the corpus, so `orphan` still reads `refs`.

THE HOLE IS STILL REFUSED. A node of the covered type that NOTHING in the corpus refines is a real gap, still named by id. Computing both sides must not soften a check into a report — that was the other failure direction, and `tsp-coverage-computes-both-sides` guards it with a positive case.

### The field descriptions

THREE ROWS ASKED FOR THE ENUMERABLE SET, in the same words: "every story as a node reference, one per line".

THEY NOW ASK FOR THE DELTA: "the stories THIS delta touched, one node reference per line — the corpus answers which exist, and only you know which this record moved."

- `M2_10C_write-stories`
- `M2_20_generalize-use-cases`
- `M3_10_write-requirements`

THE FIRST CASE IN `coverage-both-sides.test.ts` ASSERTS EXACTLY THIS, matching the served form against the defect's own wording.

### The measurement behind the row

FOUR INSTANCES ON THIS WALK, all on 2026-08-16.

- write-stories — five typed names, one grep, nothing examined.
- generalize-use-cases — twenty-two names. Twenty-seven of the twenty-nine use cases listed had not been read.
- write-requirements — thirty-three names, three greps.
- specify-build and author-tests — prefilled tables served by the engine and echoed straight back at it.

THE COST OF PASSING GREW WITH THE CORPUS AND THE VALUE STAYED AT ZERO. That is why the row is graded fatal rather than crippling.

## follow_up

CHUNK TEN IS NEXT — `the-seed-states-its-dependency`, which has no dependency of its own.

WHAT REMAINS AFTER IT. Five fixes: assertion-red, the ripple's root, the compile-time trap check, the cloud start's branch check, and the dead branch code.

FOUR RUNS ARE NOW OWED — chunks six through nine — all on the same reload, all covered by the battery at verification.

ONE THING THIS CHUNK DID NOT FIX. The prefilled node-tables at specify-build and author-tests are the same defect in a different mechanism: the engine computes the table, serves it, and refuses the submit that omits it. That is a serve-time fix rather than a check-time one, and it is not in this chunk's statement. It goes to the retro.

NOTHING IS BLOCKED.

## anything_else

### Why this was one line and took four states to find

THE CODE WAS ALWAYS READABLE. `coverProblems` is twelve lines and both halves sit next to each other — one reading `refs`, one reading `corpus`.

WHAT MADE IT INVISIBLE was that the check WORKED. It refused correctly every time, named the orphans correctly every time, and went green when the listing was complete. Nothing about its behaviour said the listing was doing the work.

IT TOOK BEING THE ONE TYPING THE LISTS. Five names, then twenty-two, then thirty-three, each time knowing I had examined none of them.

THAT IS AN ARGUMENT FOR SELF-HOSTING rather than against it, and it is worth stating plainly because the red team's steelman went the other way. An agent that only builds the machine would not have met this. An agent that also walks it met it four times in one morning.

### What the fix does not claim

IT DOES NOT MAKE THE FIELD HONEST BY ITSELF. "Which nodes did this delta touch" is still a listing, and still free to type.

WHAT CHANGED IS WHAT RIDES ON IT. Before, the coverage VERDICT depended on the listing being complete. Now the verdict comes from the graph and the listing carries only judgment — so a lazy listing costs a reader context, not a false green.
