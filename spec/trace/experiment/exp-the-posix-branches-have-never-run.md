---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: exp-the-posix-branches-have-never-run
type: "[[experiment]]"
statement: Does the lane carry unguarded Windows assumptions, or guarded branches whose POSIX side has never executed, counted over the engine source?
probes:
  - raid-lane-works-on-posix
timebox: 45 minutes
form: calculation
chunk: none — nothing was built
faked: the Linux run itself. No POSIX host was available, so this counts what the source declares rather than observing what it does.
fallback: if the POSIX branches exist but are unexercised, the first cloud run is treated as the test rather than as the deployment, and its failures are expected findings rather than surprises.
verdict: unsettled
measured: 2026-08-15. 69 platform-specific sites across engine source. Every one inspected is GUARDED by process.platform, with a POSIX alternative beside it — se-mcp.ts:53 and :73, se-pty.ts:243, :276 and :320, preflight.ts:139, package.ts:79, selftest.ts:123 and :158. None is an unguarded Windows assumption.
folds_to: Nothing structural moves. It re-frames the first spike rather than changing an element - the start step is platform-split by design, and only the Windows half has ever run. raid-lane-works-on-posix keeps its grade and gains the count.
promote: none
source_refs:
  - rank-unknowns, the seeded pick
  - req-one-command-starts-an-unattended-machine
---

## Setup

THE LINUX RUN WAS NOT POSSIBLE, so the question was narrowed to one a search
can settle: does the source assume Windows, or does it branch?

A sweep for `process.platform`, `win32`, `.exe`, `powershell` and `pwsh` over
the whole engine returned 69 sites.

## Result

THE BRANCHES ARE THERE AND THE POSIX SIDE IS WRITTEN. Not one inspected site
assumes Windows without an alternative.

THE MOST IMPORTANT ONE EXPLAINS THE FIRST SPIKE. `selftest.ts:158` reads:

    detached: process.platform !== "win32"

SO THE ENGINE ASKS FOR DETACHING ONLY ON POSIX, and this finding is about that
branch never having run.

IT IS NOT ABOUT WINDOWS BEING UNABLE TO RELEASE A CALLER. This paragraph said
so, on the strength of a measurement that has since been retracted.
[[exp-does-a-backgrounded-lane-release-its-caller]] re-timed the parent at 74
ms and carries both numbers. The caller is released on both platforms.

WHAT THE SPLIT IS ACTUALLY FOR is a POSIX process group, so a closing session
does not take the lane down. Windows has none to ask for. That is the branch
that has never executed, and it is the one this node is about.

## Why the verdict is unsettled rather than holds

BRANCHES EXISTING IS NOT BRANCHES WORKING. Every POSIX line in this engine has
been written and none has been executed, because every machine that has run it
was Windows.

CODE THAT HAS NEVER RUN IS NOT EVIDENCE. Counting it would be counting
intentions.

SO THE HONEST VERDICT IS UNSETTLED, and the timebox is not what ran out — the
host is.

## What this changes for the first cloud run

IT MOVES THE EXPECTATION RATHER THAN THE RISK. The first Linux run is a TEST,
and failures in it are findings rather than surprises.

THE FIRST PLACE TO LOOK is the detach path, because it is the one branch this
iteration already knows diverges between the platforms and the one the
entrypoint's start step depends on.
