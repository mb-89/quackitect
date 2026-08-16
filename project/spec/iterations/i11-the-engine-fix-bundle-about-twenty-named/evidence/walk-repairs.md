---
form: walk-repairs
by: agent
signed_off: 2026-08-16T12:44:42.069Z
authors: agent
files:
---

# Evidence form / walk-repairs

## current_situation

THE WALK NO LONGER POINTS BACKWARDS, and a stuck walk answers where the work is in one call.

THE TWO FIXES SHARE ONE SHAPE, which is worth naming: both are a value that means something being read as a value that means nothing. An empty target meant "cleared" and was read as "absent". A Session meant "the live walk" and was built as "a fresh object".

11 of 11 green in `branching.test.ts`, 30 of 30 across `boot`, `clear-jump`, `route` and `lanecost` — runs `test-msvsqxj3-6` and `test-msvso2r9-4`.

THE NEW CASE PASSED ON ITS FIRST RUN, deliberately. It is a regression guard for a defect fixed a week ago, not a check for new behaviour — and its first assertion exists so that a future change which quietly stops the absorb cannot leave it passing for the wrong reason.

## built

THREE REPAIRS NAMED, TWO FIXED, ONE STRUCK WITH ITS EVIDENCE.

### The router aimed at a state nobody chose

A CLEARED AIM CAME BACK AS THE FRONT DESK. `aimAt("")` is how the walk says it arrived and is headed nowhere, and it persists that empty string faithfully. `restoreTarget` then refused to restore an empty value, so `_target` kept its field default — `front_desk`.

THE RESULT: a target nobody set, pointing at a state BEHIND the walk. Seen live on this iteration — every pull inside i11 reported `target: front_desk` while walking deeper into the record.

ONE CHARACTER OF LOGIC: the guard now restores any string, including the empty one. `undefined` still restores nothing, which is the real "never set".

### A throwaway Session was being built to read one word

FOUND WHILE CHASING THE ABOVE, AND IT IS MINE. The battery refusal I added in `test-verb` did `new Session(root).active()[0]` because the tool factory had no session in scope.

CONSTRUCTING A SESSION IS NOT A CHEAP READ. It re-runs `restoreSettings`, `syncKeepAwake` and `armIdleTimer` — an idle timer per call that nobody ever cleared, and a settings restore that reinstated exactly the stale target above.

`coreTools` now takes a `whereNow` callback, wired to the live session, the same way `boundRecord` already is.

### se_why followed one link and stopped

A GREY STATE IS USUALLY GREY BECAUSE A FEEDER IS UNSIGNED, and that feeder because ITS feeder is. The verb named the first hop only, so finding the cause took one call per hop and the reader had to know to keep asking.

MEASURED ON THIS ITERATION: four grey states, cause one register three states upstream naming three deleted requirements. Three lines fixed it and all four went green in a single pull. Finding the three lines was the expensive part.

`greyRoots` now follows the chain to states with NO unsigned feeder of their own — where work actually has to happen. The answer gains a `root` list, and `says` changes shape with it: "X is WAITING, not broken. The work is at Y."

### The fired-edge discard was already fixed, and now has a guard

THE THIRD ITEM DID NOT REPRODUCE. `activatePowered` does absorb fuel aimed at an active state, and a re-entry does re-activate a finished one — both halves of the fear are real.

WHAT ALREADY COVERS IT is the green rule of 2026-08-09 at `machine.ts:727`: a busbar's edge whose source stands GREEN counts as satisfied whether or not its fuel survives.

SO NOTHING WAS CHANGED HERE. A case was added instead, and it is written so it cannot pass vacuously: it asserts FIRST that the absorb actually fired and the fuel is gone, then that the bar opens anyway. Remove the green rule and it fails.

## follow_up

NOTHING BLOCKS.

ONE THING FOR `audit-the-twenty`. The stale-target defect was invisible because it only appears after a Session is rebuilt, which happens on a reload and happened on every battery attempt. Any other throwaway `new Session(...)` has the same reach. Two remain, both in `bin/` entry points where a fresh session is the point.

NEXT: `narration-grace`, then `mirror-buttons` — the stop-at dial.

## anything_else

