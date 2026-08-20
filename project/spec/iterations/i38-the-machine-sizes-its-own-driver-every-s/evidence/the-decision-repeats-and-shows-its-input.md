---
form: the-decision-repeats-and-shows-its-input
by: agent
signed_off: 2026-08-20T20:37:02.061Z
authors: agent
files:
---

# Evidence form / the-decision-repeats-and-shows-its-input

## current_situation

`tests/sizing-repeats.test.ts` went green with the block itself, and this chunk is where that is examined rather than assumed. Its six cases are the whole of `req-a-machine-decision-repeats` in scope here: the same inputs give the same answer, and the engine records what it read.

## built

NOTHING WAS ADDED FOR THIS CHUNK, AND THAT IS THE FINDING RATHER THAN A GAP. The block repeats because of what it is, not because something guards it.

- IT HOLDS NO STATE. `rungFor` and `publish` are functions of their argument; there is nothing to carry between calls and nothing to invalidate.
- IT READS NOTHING AT CALL TIME. The difficulty arrives on the step, put there at compile time. No file, no clock, no environment.
- ITS TABLES ARE MODULE CONSTANTS. `JUDGEMENT_RUNGS`, `READING_RUNGS` and `RUNGS` are frozen lists in source, so the mapping is the same in every process.

THE SIX CASES CHECK THAT IT STAYS THAT WAY, which is the only thing a test can do about a property like this. A hundred repetitions in one process, one in a FRESH process, and the same set sized in two orders — each fails a different way of breaking it, and the fresh-process case is the one an in-process cache would sail past.

THE INPUT IS RECORDED BECAUSE THE DESIGN PUBLISHES IT, not because a field was added for the audit. `publish` sends the pair beside the rung, and one case re-derives the rung FROM the recorded pair. Recording an input nobody checks is what that case exists to refuse.

AND THE LAST CASE KILLS THE FALSE GREEN. A changed input changes the answer — without it the five above pass on a block that returns a constant.

## follow_up

THE REPEATABILITY THIS CHUNK ESTABLISHES IS WITHIN A HOST, and the requirement asks for every machine. That half is `req-one-model-list-is-read-live-from-the-repository` and it is INSPECTED rather than tested, because a test proves the answer on the machine that ran it and the project registers three hosts of two vendors.

`tsp-the-published-strength-is-the-same-on-every-host` IS OWED A REAL RUN AT `verification`. Its checklist was accepted as unobservable at `observe-red` because the path did not exist. It exists now, and a spec accepted as unfalsifiable before the build and never re-run after it is coverage that never happened.

THE PATH IS SHORT ENOUGH TO READ IN FULL: `difficultyOf` reads a field, `rungFor` indexes two frozen lists, `publish` copies. No environment read, no network call, no clock, no randomness, and no filesystem path reaches a published value.

## anything_else

