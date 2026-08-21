---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: dsp-unattended-entrypoint
type: "[[design-spec]]"
statement: one command from a repository address and an iteration id to a walking agent, seven steps that each fail by name, with the runtime pinned and the lane released
realizes:
  - el-entrypoint
  - if-bootstrap-to-entrypoint
  - if-preflight-to-entrypoint
  - if-project-producer-to-entrypoint
  - if-entrypoint-to-walk-engine
files:
  - deliverable/engine/bin/se-start.ts
  - deliverable/package.json
---

## The four crossings at the entrypoint, claimed 2026-08-20

`specify-build` ran its law over the whole corpus and found ten crossings
realized by no spec. Four are the entrypoint's and they divide cleanly.

THREE ARE INBOUND AND THEY ARE THE SAME SHAPE: something that ran ONCE hands
something to the path that runs EVERY TIME.

- `if-bootstrap-to-entrypoint` — a toolchain and a scaffolded product.
- `if-preflight-to-entrypoint` — the checks that ran before anything was
  written.
- `if-project-producer-to-entrypoint` — a folder that is a project.

THE ENTRYPOINT LEARNS NOTHING ABOUT WHAT PRODUCED IT beyond the fact that a
machine can run and a folder is a project. That is designed rather than
incidental: it runs on machines the installer touched months ago.

ONE IS OUTBOUND AND IT IS NEWER. `if-entrypoint-to-walk-engine` carries the
connected harness identity and its measured limits, and it is here because the
ENTRYPOINT is what implements identifying the harness — the name has to be
available before the first work state, which is before the walk engine has run
anything.

## Responsibility

A HOST WITH A SHELL AND A CLONE reaches a walking agent on a named iteration,
from one command, with nobody typing anything after it.

THE CLONE IS THE HOST'S, NOT THIS COMMAND'S. The entrypoint is a file inside
the repository, so nothing can invoke it before a clone exists. `--repo` is
therefore CHECKED against origin rather than used to clone, which catches the
failure that actually happens: a machine walking the wrong checkout.

A `--root` FLAG STOOD HERE AND WAS CUT. Three steps honoured it and two
ignored it, so `--root <fresh dir>` cloned there and started the lane on the
entrypoint's own tree. Found at i28's verification. The root is derived from
this file's location, and a flag that is right for some steps is worse than no
flag.

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
- ADOPT CLAIMS, AND A CLAIM IS THE POINT OF THE STEP. It stood for one
  iteration reading `git rev-parse` and printing that the branch was present,
  which claims nothing. Two machines given one id would both have walked it.
- LAUNCH STARTS AN AGENT, and places the cage before it does. It stood for one
  iteration checking two files existed and printing `ready`, which produced no
  walking agent at all. Both were found at i28's verification.
- A USAGE ERROR IS NOT A STEP FAILURE. It exits 2 without a step's name, so a
  caller who forgot an argument is not sent to look at the runtime.

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

### start releases its caller, and the detach is for a different reason

THE LAUNCHING COMMAND MUST RETURN while the lane keeps running. Four steps run
after start, and none of them runs if start blocks.

IT DOES RETURN, ON BOTH PLATFORMS. Measured at 74 ms against a child living 20
seconds ([[exp-does-a-backgrounded-lane-release-its-caller]]).

AN EARLIER READING SAID THE OPPOSITE and this spec was built on it. It
recorded 45,600 ms and it is retracted: it timed the lane runner around the
parent, which waits on the child it inherited, rather than the parent itself.
The experiment node carries both numbers and the diagnosis.

SO THE DETACH IS NOT WHAT MAKES THE STEP RETURN. It stays for the reason
`selftest.ts:158` already splits on: a POSIX process group, so a closing
session does not take the lane down. Windows has none to ask for, and
detaching there opens a console an unattended host has nobody to see.

THE POSIX BRANCH HAS STILL NEVER RUN. Every machine that has run this engine
was Windows ([[exp-the-posix-branches-have-never-run]]), and whether a POSIX
host reaps the lane with its session stays owed.

THE TEST ASSERTS THE GAP, and it binds to the entrypoint's own spawn options
rather than a copy. It ran skipped on Windows for one iteration, on the
strength of the retracted number, which left the only load-bearing assertion
executing on no platform at all.

## What this spec does not decide

HOW THE RUNTIME ARRIVES. A declared image would delete verify and install
entirely, and [[cand-the-host-is-declared]] was not adopted. The steps are
written so an image can replace them later without changing the other five.


## What the entrypoint hands the walk engine

THE HOST IS MEASURED ONCE, AT BRING-UP, and the profile is handed over with the
live lane. That crossing is `if-entrypoint-to-walk-engine` and it carries two
flows: the harness profile and the live lane itself.

WHY IT IS MEASURED HERE AND NOWHERE ELSE. The entrypoint is the only code that
runs before the engine exists, so it is the only place that can tell the engine
what it started under. An engine asking mid-walk would be asking about a host it
is already running on, which cannot fail informatively.

WHAT THE PROFILE IS FOR. The engine serves steps sized for the host it actually
got. A profile that arrives late, or not at all, is the shape behind two
measured breaches on `if-agent-harness-to-entrypoint`: a lane restart came back
without the owner's autonomy grant, twice, and said nothing.
