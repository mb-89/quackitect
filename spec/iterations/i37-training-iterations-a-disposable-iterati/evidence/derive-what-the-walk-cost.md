---
form: derive-what-the-walk-cost
by: agent
signed_off: 2026-08-20T09:57:38.438Z
authors: agent
files: null
---

# Evidence form / derive-what-the-walk-cost

## current_situation

derive-what-the-walk-cost, the first of five chunks, and one of the two with no dependencies.

IT CARRIES A PROMOTED SPIKE. `exp-can-cost-per-state-be-derived-from-the-call-log` came back HALF FALSE at M6: 0 of 1282 call records carry a state, and only the 219 update calls carry anything positional at all. The carry-forward rule was the fix that spike produced, and this chunk is that fix built.

TRUNK WAS MERGED FIRST, by owner instruction. It was 30-odd commits ahead and carried a generalisation of a fix I had made by hand an hour earlier.

## built

`costPerState` in `project/deliverable/engine/benchmark-report.ts`.

THE RULE. Walk the log in order. Every `se_pull` answer names its `where`; every call after it belongs to that state until the next pull names a different one.

THE NAMING PULL BELONGS TO THE STATE IT NAMES, not to the one it left. It is the call that did the work of arriving, and charging it backwards would bill every state for its successor's entry. The case pins that: three calls to the first state and two to the second, from a five-call log.

WHAT IT COUNTS. Calls, milliseconds, forms filled, forms REFILLED after a refusal, refusals by clause, and times entered.

TWO EDGES ARE DELIBERATE AND BOTH ARE IN THE CODE.

- A CALL BEFORE THE FIRST PULL HAS NO HOME and is dropped. Inventing one would put boot cost on whichever state happened to come first.
- A REFUSAL WITH NO CLAUSE IS A CRASH, not a typed refusal, and the two are not added together. `clauseOf` returns undefined and the call still counts toward calls and milliseconds.

VERIFIED. The battery ran whole: 1617 tests, 1598 pass. Four failures remain in this file and all four belong to `stand-the-rewound-tree`, which is a different chunk. This chunk's case passes and it was red before the build.

## follow_up

- stand-the-rewound-tree is the other dependency-free chunk and it owns the four cases still red.
- THE ATTRIBUTION IS AN INFERENCE AND ITS LIMITS ARE FILED. `raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls` is open and unprobed. A call made from somewhere else between two pulls lands on the wrong state, and nothing in the log distinguishes it. Subagent work is the likeliest case.
- THE PROMPT LAYER WAS RE-PROJECTED after the merge. Preflight caught it stale and named its own remedy; `place-prompt-layer.ts` fixed it and preflight is green.
- THE MERGE TOOK TRUNK'S SIDE ON FIVE RAID GRADES. My branch carried grades i37 assigned under the register condition that made it grade seventeen entries it did not write. Trunk's are the owners' own.

## anything_else

TRUNK HAD ALREADY GENERALISED A FIX I MADE BY HAND AN HOUR EARLIER, and the comparison is worth keeping.

I scoped `claimSpecItems` to the walking record because observe-red handed i37 twenty-one checkboxes, twenty of them other iterations'. Trunk's `38d811e3` did the same thing better: a shared `scopedToOwner` helper used by every `$`-source, with an `:all` opt-out for the cases that genuinely want the whole corpus.

THE MERGE TOOK TRUNK'S VERSION WHOLE and my hand fix was discarded. What survived is the part that was actually mine: `tests/checklists-stay-home.test.ts` now pins that BOTH HALVES of observe-red scope to the same record — the engine half in `red-observed.ts` always did, the form half did not, and one state answering two ways about whose specs it means is the defect underneath.

TWO AGENTS FOUND ONE BUG FROM OPPOSITE ENDS. Trunk found the general shape and built the helper. This walk found a specific state contradicting itself and could not see the general shape from there. Neither half is redundant, and the test is the only part of mine worth keeping.
