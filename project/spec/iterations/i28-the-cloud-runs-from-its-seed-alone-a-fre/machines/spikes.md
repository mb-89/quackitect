---
steps:
  - id: spike-does-a-backgrounded-lane-survive
    statement: "Timebox 30 min: start the lane on a Linux host so the launching command returns, then check the process is still answering a minute later."
    depends_on: []
    realization: software
  - id: spike-what-runtime-a-default-install-gives
    statement: "Timebox 20 min: on a host nobody prepared, run what the entrypoint would run and record the node version it ends up with, against the declared floor of 22.6."
    depends_on: []
    realization: software
  - id: spike-does-the-lane-behave-on-posix
    statement: "Timebox 45 min: run the battery on Linux and record which cases fail on path handling alone."
    depends_on: []
    realization: software
---

# spikes — i28

Three unknowns, picked at rank-unknowns over the exposure chart. Every one of
them blocks the entrypoint, and none of them blocks the claim work.

THAT IS NOT A COINCIDENCE. The claim and worktree questions were settled by
the owner's rulings of 2026-08-15. What is left unproven is the machine that
has to start.

## What each spike settles

| spike | register entry | grade | what a run would prove |
| --- | --- | --- | --- |
| a backgrounded lane survives | raid-asm-a-host-keeps-a-backgrounded-lane-alive | fatal | whether the entrypoint's start step can work at all |
| what runtime a default install gives | raid-asm-the-installed-runtime-is-one-the-engine-runs-on | crippling | whether verify-and-install reaches the engine's floor |
| the lane behaves on POSIX | raid-lane-works-on-posix | crippling | whether path handling written on Windows survives Linux |

## The blocker they share

NONE OF THEM CAN RUN ON THIS MACHINE. All three need a Linux host that nobody
has prepared, which is exactly what
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]] says the
owner owns.

SO THE SPIKES ARE REAL WORK WITH A REAL BLOCKER. Saying it here is better than
discovering it inside the run.

## Why the fatal one is first in the table

IF A HOST REAPS THE LANE when the starting command returns, the seven-step
entrypoint is the wrong SHAPE rather than an incomplete one. Every other
answer in this iteration assumes a lane that keeps running after nobody is
watching.
