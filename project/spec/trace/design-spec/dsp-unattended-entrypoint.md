---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: dsp-unattended-entrypoint
type: "[[design-spec]]"
statement: one command from a repository address and an iteration id to a walking agent, seven steps that each fail by name, with the runtime pinned and the lane released
realizes:
  - "el-entrypoint"
files:
  - "project/deliverable/engine/bin/se-start.ts"
  - "project/deliverable/package.json"
---

## Responsibility

A HOST WITH A SHELL AND NOTHING ELSE reaches a walking agent on a named
iteration, from one command, with nobody typing anything after it.

SEVEN STEPS IN ORDER, and each one exits non-zero naming itself.

| step | what it does |
| --- | --- |
| verify | checks the runtime against the PIN, and names the pin when it does not match |
| install | installs the project and nothing else |
| start | starts the lane and RETURNS |
| wait | waits for the health check rather than racing it |
| fetch | brings the iteration's refs into the clone |
| adopt | claims the named iteration, or names the holder |
| launch | starts the caged walker with the cage on its command line |

## Behavior and constraints

- ONE SENTENCE, NAMING ONE STEP. Every failure of the first cloud run
  presented as "the server is not there", which points at the wrong step in
  six of the seven cases.
- IT INSTALLS WHAT IS MISSING AND NOTHING ELSE. The first cloud run installed
  python3, make and g++, none of which was needed.
- NOTHING IS READ AS PROSE. The command takes two arguments and reads no
  document to decide what to do.

## The two constraints the spikes wrote

### verify compares against a PIN, never a floor

`package.json` DECLARES `>=22.6` AND THAT IS WRONG. The engine spawns every
script as `node <file>.ts` with no flag, so it needs the version where
unflagged TypeScript execution is the default, not the version where it became
possible behind one.

SO THE DECLARATION IS CORRECTED and the entrypoint compares against an exact
version. A host landing on 22.x must fail at step one by name rather than at
step three as a syntax error.

Measured and recorded in
[[exp-what-runtime-the-engine-actually-needs]].

### start uses an explicit platform detach, never a background flag

THE LAUNCHING COMMAND MUST RETURN while the lane keeps running. Four steps run
after start, and none of them runs if start blocks.

MEASURED ON WINDOWS: a child sleeping 45 seconds held its caller for 45,600 ms
with `detached: true`, `unref()` and `stdio: 'ignore'` all set
([[exp-does-a-backgrounded-lane-release-its-caller]]).

THE ENGINE ALREADY SPLITS THIS BY PLATFORM. `selftest.ts:158` asks for
detaching only when the platform is not win32, so the POSIX branch is the one
a cloud host takes and it has never executed
([[exp-the-posix-branches-have-never-run]]).

SO THE STEP IS BUILT AGAINST THE POSIX BRANCH and proven by a test that
asserts the caller returned BEFORE the child ended. A test that only checks
the lane answers would pass while the command still hangs.

## What this spec does not decide

HOW THE RUNTIME ARRIVES. A declared image would delete verify and install
entirely, and [[cand-the-host-is-declared]] was not adopted. The steps are
written so an image can replace them later without changing the other five.
