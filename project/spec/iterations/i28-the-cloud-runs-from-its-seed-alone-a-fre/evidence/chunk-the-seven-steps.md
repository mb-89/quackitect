---
form: chunk-the-seven-steps
reopened: "2026-08-15T19:29:51.596Z — the join was reached with a parallel leg unwalked; reopening puts the walk back where the leg is reachable"
by: agent
signed_off: 2026-08-15T19:31:59.873Z
authors: agent
files:
---

# Evidence form / chunk-the-seven-steps

## current_situation

The entrypoint exists. Seven steps in one script, each exiting non-zero naming itself.

THE TWO MEASURED FAILURES ARE BUILT AGAINST, not around. The verify step reads the pin from package.json rather than checking a floor, and the start step detaches explicitly on the platform that can.

## built

`project/deliverable/engine/bin/se-start.ts`, new.

    node engine/bin/se-start.ts --repo <url> --iteration <id> [--root <dir>]

SEVEN STEPS, IN ORDER, each with one exit path that prints `<step>: <why>` and nothing else.

- verify — reads `engines.node` from package.json and compares the running major against it. The pin is READ, never copied, so the two cannot drift.
- install — `npm install` in the deliverable and nothing else. The first cloud run installed python3, make and g++, none of which was needed.
- fetch — clones when there is no `.git`, fetches when there is.
- start — spawns the lane with `detached: process.platform !== "win32"`, `stdio: "ignore"`, then `unref()`, and RETURNS.
- wait — polls the mirror until it answers or 60 s pass. A fixed sleep is a race with a friendly face.
- adopt — verifies the named iteration's branch exists, naming it when it does not.
- launch — checks the cage template is present and reports it by path.

`project/deliverable/tests/unattended-start.test.ts`, new. Three cases, 2 pass and 1 skipped, 0 fail.

- THE CALLER IS RELEASED. It times how long the launching command took against a child that outlives it, and fails if the parent waited. Skipped on Windows with the reason on the skip, because Windows was MEASURED unable to detach and the target is POSIX.
- THE PIN IS RUNNABLE. It refuses a declared major below 23, because the engine spawns `node <file>.ts` with no flag.
- EVERY FAILURE NAMES A STEP. It reads the source and refuses any `die()` naming something outside the seven.

`npx tsc --noEmit` exits 0.

## follow_up

- chunk-release-the-caller is the other parallel leg and carries the same two artifacts; nothing further is owed there
- THE DETACH ASSERTION IS SKIPPED ON THIS PLATFORM and runs on the first Linux host. That is the branch which has never executed.
- THE `launch` STEP REPORTS RATHER THAN SPAWNS an agent. Starting a caged walker needs a host command this machine cannot name, and inventing one would be worse than saying so.
- verification is next, and the battery judges whether the 92 routed call sites and this new file left anything red
- nothing is parked from this state

## anything_else

### What the detach test asserts that a naive one would not

A TEST THAT CHECKS "THE LANE ANSWERS" PASSES WHILE THE COMMAND HANGS. The lane does answer — from a process the caller is still waiting on.

SO THE ORACLE IS THE GAP. The parent's wall clock is compared against the child's own lifetime, and the assertion is that the parent came back while the child was provably still running.

THE FAILURE MESSAGE SAYS WHAT IT COSTS: every entrypoint step after start would never run.

### Why the skip is honest rather than convenient

WINDOWS CANNOT DETACH AND THAT IS MEASURED, not assumed. 45,600 ms for a 45-second child, with every flag set.

THE SKIP CARRIES THAT REASON ON ITSELF, so a reader does not have to guess whether it was skipped because it is hard.

THE TARGET IS POSIX, where the engine already asks for detaching — `selftest.ts:158` makes the same split. This build joins that branch rather than inventing a second one.

### What `launch` does and does not do

IT CHECKS THE CAGE IS THERE AND REPORTS ITS PATH. It does not spawn an agent.

STARTING A CAGED WALKER NEEDS A HOST COMMAND, and which command depends on the harness the runner uses. Guessing one would put a string in the entrypoint that nobody has run.

SO THE STEP STOPS AT THE LAST THING IT CAN PROVE, and says so, rather than pretending to a launch it cannot make.
