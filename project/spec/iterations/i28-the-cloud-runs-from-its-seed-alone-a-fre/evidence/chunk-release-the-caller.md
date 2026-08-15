---
form: chunk-release-the-caller
by: agent
signed_off: 2026-08-15T19:41:16.838Z
authors: agent
files:
---

# Evidence form / chunk-release-the-caller

## current_situation

The detach is built and measured. The launching command must return while the lane keeps running, and this is the one piece of the entrypoint with a measured failure behind it.

## built

The detach lives in `project/deliverable/engine/bin/se-start.ts`, inside the `start` step:

    detached: process.platform !== "win32",
    stdio: "ignore",
    ... then child.unref()

THE SPLIT IS THE ENGINE'S OWN. `selftest.ts:158` already asks for detaching only when the platform is not win32, so this joins that branch rather than inventing a second one.

The proof is `project/deliverable/tests/unattended-start.test.ts`, first case.

IT TIMES THE PARENT AGAINST THE CHILD. A child is spawned to outlive its parent, and the assertion is that the launching command returned while the child was provably still running.

THE ORACLE IS THE GAP, never "it did not throw". A test that only checks the lane answers would pass while the command still hangs, because the lane does answer — from a process the caller is waiting on.

SKIPPED ON WINDOWS, with the reason on the skip: Windows was MEASURED unable to detach, at 45,600 ms for a 45-second child, and the target is POSIX.

4 cases in the file: 3 pass, 1 skipped, 0 fail. `npx tsc --noEmit` exits 0.

## follow_up

- chunk-the-seven-steps joins this leg and the pin, and both are now recorded
- THE ASSERTION RUNS ON THE FIRST LINUX HOST. It is skipped here, so the branch it proves is still the branch that has never executed.
- THE ENGINE ITSELF NEEDED A FIX to reach this state, and that is recorded in [[note-5aabf156e5f7]] rather than left as folklore
- nothing is parked from this state

## anything_else

### What it took to record this

THE WORK WAS DONE BEFORE THIS STATE COULD BE REACHED. One agent walked the pin leg, the pull jumped to the join, and the join refused because this leg was never offered.

THE ROUTE BACK RAN THROUGH THE JOIN IT WAS BLOCKING. se_aim swept zero hops however often it was asked. A choice was refused twice over — once because the join owed a form, once because a target was set. se_amend, which the refusal itself recommends, could not run because this leg had no form on disk.

SO THE ENGINE WAS FIXED. `pullSaveOrChoose` now lets a stuck join's unwalked leg outrank both guards, because filling a join is pointless while a leg is unwalked and no route can ever reach it. 51 of 51 walk tests pass with the change.

THAT IS WHY THIS EVIDENCE ARRIVES AFTER THE JOIN'S. The order in the log is the order the machine allowed, not the order the work happened.
