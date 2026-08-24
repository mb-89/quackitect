---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-asm-a-launched-process-can-be-asked-whether-it-still-exists
type: "[[raid]]"
kind: assumption
statement: "The engine can ask, cheaply and on both platforms, whether a process it launched still exists, without the process having been written to answer."
owner: the maintainer
trigger: "the first heartbeat implementation, and any move to a host the engine has not run on"
status: probed
looked: 2026-08-24
probed: 2026-08-24
impact: "The whole heartbeat rests on this. If existence cannot be asked without cooperation, the design collapses back to a timeout, which is a guess about something quiet and is exactly what this record set out to replace."
breaks_how_badly: fatal
how_likely: conceivable
probe: "NOT PROBED YET. The probe is one measurement per platform: launch a child, let it exit, and check that the held handle reports it gone within one interval. The POSIX branch is the one to watch, because it has never run here. deliverable/engine/run.ts line 59 detaches on POSIX and not on Windows, and guidance/method/cloud-runner.md records that every machine that has run this engine was Windows."
source_refs:
  - i62-background-work-reports-its-own-end-the-
weighs_with: raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet
weighs_against: none
---

## Why this is an assumption and not a risk

THE DESIGN IS ALREADY RELYING ON IT. Every goal in this record above the
self-closing entry is built on the engine holding a live handle and asking it
a question.

## What is actually being assumed

- A HANDLE OUTLIVES THE PROCESS long enough to be asked about it.
- ASKING IS CHEAP ENOUGH TO DO ON AN INTERVAL, for every job at once.
- THE ANSWER IS THE SAME ON BOTH PLATFORMS the engine runs on.

The third is the weak one. The detach differs by platform already, and a
detached child on POSIX leads its own process group.

## Why conceivable rather than plausible

It takes an unusual combination: a host where the handle is kept, the process
is gone, and the two cannot be connected. No such host is known here.

WHAT MAKES IT WORTH RECORDING ANYWAY is the damage. Nothing else in the record
survives this being false.

## Probe

NOT PROBED YET. The probe is one measurement per platform, and it is cheap.

- Launch a child through the run lane and let it exit on its own.
- Hold the handle and ask it, on the interval, whether the process exists.
- Check that the answer flips to gone within one interval of the exit.

RUN IT ON BOTH PLATFORMS. The POSIX branch is the one to watch, because it
has never run here: deliverable/engine/run.ts line 59 detaches on POSIX and
not on Windows, and guidance/method/cloud-runner.md records that every machine
that has run this engine was Windows.

WHAT FALSIFIES IT: an exit the handle never reports, or a report that costs
enough to matter when every job is asked at once.

## Probe result, 2026-08-24 — HOLDS on POSIX

RUN ON THE BRANCH THAT HAD NEVER RUN. linux, node v22.22.2. The script is in
the call log; it launched children through the same detached spawn the product
uses and asked the handle afterwards.

| case | what the handle said | what the pid check said |
| --- | --- | --- |
| child alive | exitCode null, signalCode null | exists |
| child exited normally | exitCode 0 | ESRCH |
| child killed with SIGKILL | signalCode SIGKILL | ESRCH |

BOTH CHANNELS ANSWER, AND THEY ARE NOT EQUALLY GOOD. The handle names HOW the
process ended; the pid check only says whether something with that number is
there.

SO THE DESIGN SHOULD ASK THE HANDLE, NOT THE PID. A pid is reused by the
operating system, so a reaped child's number can come back attached to an
unrelated process. That would report a dead run as alive, which is the exact
fault this record exists to remove.

THE COST WAS MEASURED IN THE SAME RUN, and it is the sibling assumption's
answer: 20 handles asked in 78 microseconds, 100 in 147.

WHAT IS STILL UNPROBED: the Windows branch. Every machine that has run this
engine before today was Windows, so that half is the one with field evidence
and no measurement, and this one is the reverse.
