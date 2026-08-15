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
verdict: holds
measured: "2026-08-15, Windows, node v24.16.0, RE-MEASURED at i28's verification. The parent process exited 74 ms after spawning a child that sleeps 20 s. The caller is released. THE FIRST READING OF 20,609 ms AND 45,600 ms IS RETRACTED: it timed the lane runner around the parent, which waits on the child it inherited, not the parent itself."
folds_to: "el-entrypoint's start step releases its caller on both platforms, so nothing downstream depends on a platform split for that reason. The detach stays for a DIFFERENT reason - a POSIX process group so a closing session does not take the lane down - and that reason is untested here. The assumption splits in two: releasing the caller is a spawn question and is answered here, surviving the session is a host question and stays owed."
promote: "none"
source_refs:
  - rank-unknowns, the seeded pick
  - req-one-command-starts-an-unattended-machine
---

## Setup

A parent node process spawns a child with the detachment flags node offers,
then has nothing left to do. Its own event loop is empty.

- `detached: true` on POSIX, `false` on Windows
- `stdio: 'ignore'`
- `child.unref()`

THE THING BEING TIMED IS THE PARENT, and getting that wrong is what produced
the first answer. The parent is the entrypoint. What matters is whether IT
comes back, not whether the tool that launched it comes back.

## Result

THE CALLER IS RELEASED.

| child sleeps | the parent process exited after |
| --- | --- |
| 20 s | 74 ms |

THE CHILD SURVIVED. Nothing reaped it. So the half of the assumption about a
host killing a backgrounded process is still not disproven here.

## The first reading, and why it was wrong

THE FIRST RUN RECORDED 20,609 ms AND 45,600 ms and concluded the parent never
returns. It ran "through the lane's own runner", and that is the whole error.

THE RUNNER WAITS ON HANDLES THE CHILD INHERITED. So it was still there long
after the parent had gone, and its wall clock was recorded as the parent's.

THE RE-RUN TIMED THE PROCESS DIRECTLY, with a shell clock around `node
probe.mjs` rather than around the lane call. Corroborating: the lane call
wrapping that same re-run reported 893 ms while the parent inside it printed
its own exit at 74 ms. Three numbers, one process, and only the middle one
belongs to the parent.

MEASURE THE THING THE DECISION IS ABOUT. The decision was about the
entrypoint's own return, and the instrument was pointed one level out.

## What the retraction cost, and what it did not

FOUR ARTIFACTS WERE BUILT ON THE WRONG NUMBER, all corrected at i28's
verification.

- The start step's platform split, which now carries its real reason.
- A test skipped on Windows, which suppressed a case that passes.
- A line in the cloud-runner card telling an unattended agent that Windows
  cannot detach.
- A constraint in the entrypoint's design spec.

NOTHING SHIPPED ON IT. The verification found it before the gate, which is
what verification is for.

## What is still owed

WHETHER A POSIX HOST REAPS THE LANE with its session. That needs the host this
machine cannot make, and it stays owed under
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]].

THE TWO QUESTIONS ARE SEPARATE and were tangled in one assumption. Releasing
the caller is a spawn question, answered here. Surviving the session is a host
question, answered on the host.
