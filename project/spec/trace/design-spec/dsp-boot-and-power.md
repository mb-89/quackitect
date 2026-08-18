---
minted_in: i1
id: dsp-boot-and-power
type: "[[design-spec]]"
statement: the engine standing up and lying down, carried by the host bridge, the stop hook, the boot bench and the packager
realizes:
  - el-bootstrap
files:
  - project/deliverable/engine/bin/se-pty.ts
  - project/deliverable/engine/bin/se-hook-stop.ts
  - project/deliverable/engine/bin/se-hook-start.ts
  - project/deliverable/engine/pullnotice.ts
  - project/deliverable/engine/bin/package.ts
  - project/deliverable/engine/version.ts
---

## Responsibility

The seam between the engine and the host it lives in: the pty bridge
that keeps a terminal session alive, the stop hook that reports the
session's trail when a host turn ends, and the boot bench that keeps
standing up fast. The packager assembles the shippable archive - the
same tree the export copies, zipped, with the entry README rendered
in - so standing up can start from one file. The shutdown-at-idle countdown and the end-state
trigger land here when they are built — the requirement stands
(req-shutdown-fires-only-idle-or-end), the mechanism is owed.

## What survives a reload, and what does not

SETTINGS SURVIVE THE ENGINE, NOT THE SESSION. The mirror's controls restore
across a RELOAD like the decision graph, from one store restored wholesale.
A session that ended and started again is a NEW session and takes the defaults.

THE SHIM STAMPS EACH CHILD WITH A TOKEN, and matching it is what tells the two
apart. It fails safe: an absent or unfamiliar stamp simply does not restore.
There is no cleanup step to forget, so a crash or a power cut cannot leave the
last session's controls standing.

## The reading credit survives a reload

THE AGENT READ THE WORDS. Replacing the process did not unread them.

TWO CONDITIONS, AND THE SECOND IS THE ONE THAT WAS MISSING. The session stamp
says this is the same session, so a compaction still re-owes the whole reading.
The PROCESS ID says the engine actually restarted — without it a second session
built inside one process would inherit a credit it never earned.

FRESHNESS IS DECIDED NOWHERE NEAR HERE. Every entry is re-checked against disk
wherever it is used, so a document whose words moved is owed again by
construction rather than by a second mechanism that could disagree.

## The target survives a reload; the position does not

THE POINT OF BOOT IS TO BOOT THE AGENT, NOT THE MACHINE.

IT DOES NOT CONTRADICT THE DESK RULE. Every engine START still aims at the
front desk, because a start has no matching session stamp to restore from.
Only a RELOAD restores, on the same two conditions the reading credit uses.

THE POSITION IS STILL NOT REMEMBERED. Evidence gives the position, the target
gives the direction, and the recompute walks back on its own. Before this, a
reload mid-record landed at the desk with nothing aimed, so the agent paid an
aim and a sweep to stand where it already stood.

AN UNREACHABLE RESTORED TARGET IS SAFE. The route cannot be drawn and the pull
answers wait, which is the same answer a stale aim has always produced.
