---
form: chunk-pin-the-runtime
by: agent
signed_off: 2026-08-15T19:24:52.072Z
authors: agent
files:
---

# Evidence form / chunk-pin-the-runtime

## current_situation

The declared floor said `>=22.6` and the engine has never been able to run on it.

EVERY SCRIPT IS SPAWNED AS `node <file>.ts` WITH NO FLAG. That needs the version where unflagged TypeScript execution is the default, not the version where it became possible behind one.

## built

`project/deliverable/package.json` line 8, engines.node: `>=22.6` becomes `>=24.0.0`.

WHY 24 AND NOT SOMETHING LOWER. 24.16.0 is the only version this engine has been OBSERVED to run on, read from `node --version` on the machine that walks it.

A FLOOR WE CANNOT PROVE IS NOT A FLOOR. Guessing the exact release where the behaviour became default would put a number in the file that nobody here has tested, which is the same fault as the one being fixed.

SO THE PIN IS CONSERVATIVE ON PURPOSE. It may exclude a host that would have worked. It cannot admit one that does not, and for an unattended start that is the trade worth taking.

## follow_up

- chunk-release-the-caller runs next, and it is the fatal one
- THE VERIFY STEP READS THIS PIN. chunk-the-seven-steps compares the running version against `engines.node` rather than against a hard-coded string, so the two can never drift.
- IF A LINUX HOST IS FOUND TO RUN CLEANLY ON 23.x, the pin can come down, and the evidence for that is a run rather than a recollection
- nothing is parked from this state

## anything_else

### What this fixes, in the failure's own terms

A HOST INSTALLING TODAY'S LTS CAN LAND ON 22.x. It satisfied `>=22.6` exactly, so the verify step would have called it good and the run would have died at step three inside a spawned script.

NOW IT FAILS AT STEP ONE, and the message names the runtime.

### Why the pin lives in package.json rather than in the entrypoint

ONE SOURCE OF TRUTH. The entrypoint reads `engines.node` instead of carrying its own copy, so correcting the requirement is one edit in the place that already declares it.

A SECOND COPY IN A SCRIPT would drift the first time somebody bumped one of them.
