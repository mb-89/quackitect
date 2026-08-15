---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: exp-does-a-backgrounded-lane-release-its-caller
type: "[[experiment]]"
statement: Can a command start the lane and return, leaving it running, measured as the launching command's wall clock against the child's lifetime?
probes:
  - raid-asm-a-host-keeps-a-backgrounded-lane-alive
timebox: 30 minutes
form: script
chunk: "none — the child was a bare sleeping process"
faked: the lane itself. The child was a bare node process sleeping, not the engine, so this measures the SPAWN mechanism and not the engine's own startup.
fallback: if a launched process cannot release its caller, the entrypoint's start step uses an explicit platform detach rather than a background flag, and the step is proven by this same measurement before anything downstream is built.
verdict: falls
measured: "2026-08-15, Windows, node v24.16.0. A child sleeping 45 s: the launching command returned after 45,600 ms. A child sleeping 20 s: 20,609 ms. The caller waits for the child in both cases."
folds_to: "el-entrypoint's start step cannot use a background flag and must use an explicit platform detach. The assumption splits in two - releasing the caller is a spawn question and is answered here, surviving the session is a host question and stays owed."
promote: "none"
source_refs:
  - rank-unknowns, the seeded pick
  - req-one-command-starts-an-unattended-machine
---

## Setup

TWO RUNS, ON THIS MACHINE, THROUGH THE LANE'S OWN RUNNER.

A parent node process spawned a child with every detachment flag node offers.

- `detached: true`
- `stdio: 'ignore'`
- `child.unref()`

The parent then printed the child's pid and had nothing left to do. Its own
event loop was empty.

## Result

THE PARENT DID NOT RETURN UNTIL THE CHILD ENDED.

| child sleeps | launching command returned after |
| --- | --- |
| 20 s | 20,609 ms |
| 45 s | 45,600 ms |

THE CHILD SURVIVED BOTH TIMES. Nothing reaped it. So the half of the
assumption about a host killing a backgrounded process is NOT disproven here.

WHAT FALLS IS THE OTHER HALF. The assumption is worded "after the command that
started it returns", and on this platform that command does not return. The
premise never arises.

## Why this matters before any cloud host is involved

THE ENTRYPOINT HAS SEVEN STEPS AND `start` IS THE THIRD. It starts the lane,
and then four more steps have to run: wait, fetch, adopt, launch.

IF START NEVER RETURNS, THE FOUR STEPS AFTER IT NEVER RUN. The machine would
sit with a live lane and no walking agent, which reads from outside exactly
like a hang.

THIS IS NOT A CLOUD PROBLEM AND IT IS NOT A LINUX PROBLEM. It reproduces on
the machine that wrote the design.

## What is still owed

WHETHER A LINUX HOST REAPS THE LANE with its session. That needs the host this
machine cannot make, and it stays owed under
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]].

THE TWO QUESTIONS ARE SEPARATE and were tangled in one assumption. Releasing
the caller is a spawn question, answered here. Surviving the session is a host
question, answered on the host.
