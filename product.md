---
id: quackitect
self_hosting: true
---

# What this product declares about itself

This file is the product's own declaration. It travels with the repository,
so any machine that clones this repo reads the same answer.

## self_hosting

Quackitect is SELF-HOSTING. It works on itself.

Its records get NO worktree and walk on trunk. A change to the method lands
where the walk is standing, and applies to the walk that made it.

THIS WAS AN INTENT UNTIL 2026-08-16 and is now how the system runs. i34 removed
the worktrees and the record branches, so every record is a folder on trunk.

WHY THE EXCEPTION IS SAFE AND HAS EXACTLY ONE MEMBER. A product never works on
Quackitect. Only Quackitect works on itself, and a vehicle working on itself
is the one case where the machine under the walk and the machine being changed
are the same machine.

## THE ENGINE STILL DOES NOT ACT ON THIS, AND NO LONGER NEEDS TO

Stated plainly, because a setting nothing reads is a trap.

`self_hosting` is a DECLARATION of a decided property. No code branches on it
today, and that is now correct rather than pending.

WHAT WAS SUPPOSED TO HAPPEN. The plan was to build a git adapter, LEVEL each
record's content onto trunk, then let this declaration steer `workRoot()`. The
risk was real and was watched: on 2026-08-14 i27's own content stood on its
branch — nine evidence files, four design specs and the record's machines — and
pointing the walk at trunk first would have made them vanish.

WHAT HAPPENED INSTEAD, i34 on 2026-08-16. The content was merged to trunk once,
by hand and checked before the branches were deleted, and then the RESOLUTION
SEAM ITSELF WAS DELETED. There is no second tree to steer toward, so
`workRoot()` needs no declaration to consult.

THE DANGER THE PLAN NAMED WAS REAL AND NEARLY LANDED. Immediately before the
branch deletion, trunk held one record folder and none of i34's own evidence.
The check caught it and the merge brought 35 folders and 700 trace nodes
across. That is why the order mattered, even though the destination changed.

`levelRecordTree` in `engine/supervisor.ts` still exists and is still used — by
the SATELLITE, which levels a tree before it serves. That is a different job
from the record levelling this section once planned.

## What retired SE-C-134 instead

Not this file.

`session.laneRoot` sends every METHOD path to the machine root, whatever tree
is bound. A method write can no longer land in a tree that does not own it, so
the refusal had nothing left to prevent.

That change is independent of self-hosting and it is already live.

## What this is not

It is not the autonomy dial. That is per-session, set at launch, and
deliberately never committed.

It is not a rigor setting. A change's size is judged per record, at its
kickoff.
