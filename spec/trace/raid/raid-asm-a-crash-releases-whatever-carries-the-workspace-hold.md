---
minted_in: i62-background-work-reports-its-own-end-the-
id: raid-asm-a-crash-releases-whatever-carries-the-workspace-hold
type: "[[raid]]"
kind: assumption
statement: "Whatever carries an instance's exclusive hold on a workspace is released by the operating system when that instance dies, including when it is killed without warning."
owner: the maintainer
trigger: "the first start refused on a workspace with nothing serving it, and any move to a host the product has not run on"
status: probed
looked: 2026-08-24
probed: 2026-08-24
impact: "If the hold survives its holder, a crash leaves a workspace nobody can start in. On an unattended machine there is no person to clear it, so the run ends there and the next one cannot begin."
breaks_how_badly: crippling
how_likely: conceivable
probe: "NOT PROBED YET. Start an instance, take the hold, kill it without letting it clean up, and start another at once. The second must succeed. Run it on both platforms, and run it twice on each: immediately after the kill, and again after a pause, because a hold that lingers briefly and a hold that never releases look the same in one attempt."
source_refs:
  - i62-background-work-reports-its-own-end-the-
  - req-one-instance-holds-a-folder-and-its-port
  - fn-run-a-governed-walk.hold-a-workspace-alone
weighs_with: raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash
weighs_against: none
---

## Why it is an assumption and not a decision

THE CHOICE OF MECHANISM IS A DECISION and it is ours. Whether that mechanism
releases itself on a kill is not: the operating system decides, and no reading
of our own code answers it.

## What is being leaned on

THE FUNCTION STATES IT AS A CONTROL, in as many words: whether the thing that
carries the hold releases itself when its holder dies. That is the condition
the whole design of holding a workspace rests on.

A LOCK FILE FAILS IT BY CONSTRUCTION, which is why the requirement refuses one.
The assumption is about the mechanism that replaces it.

## Why conceivable rather than plausible

The behaviour is well established on both platform families for the obvious
candidate. What makes it conceivable rather than settled is that nobody here
has run the test, and one of the two platform paths has never run at all.

## Probe

NOT PROBED YET, and it is one experiment run four times.

- Start an instance and let it take the hold.
- Kill it without letting it clean up.
- Start a second instance immediately. It must succeed.
- Start a third after a pause. It must also succeed.

RUN THE FOUR ON BOTH PLATFORMS. A hold that lingers for a moment and a hold
that never releases produce the same result in a single attempt, which is why
the pause is part of the probe rather than a refinement of it.

WHAT FALSIFIES IT: any start refused on a workspace with nothing serving it.

## Probe result, 2026-08-24 — HOLDS on POSIX

RUN AS WRITTEN, on linux with node v22.22.2. A child took a network port and
held it. It was killed with SIGKILL and given no chance to clean up.

| moment | binding the same port |
| --- | --- |
| while the child held it | EADDRINUSE |
| immediately after the kill | ok |
| after a pause | ok |

THE IMMEDIATE CASE IS THE ONE THAT MATTERED. A hold that lingers briefly and a
hold that never releases look the same in a single attempt, so the probe asked
twice on purpose. The rebind succeeded with no pause at all.

SO A RESTART AFTER A CRASH IS NOT REFUSED, and the sibling risk about locking
out a recovery does not fire for this mechanism.

WHAT IS STILL UNPROBED: the Windows branch, and any host that keeps a socket in
a waiting state after its holder dies. The probe used a loopback bind, which is
the cheapest case.
