---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: tsp-a-vehicle-cannot-reach-what-it-came-from
type: "[[test-spec]]"
statement: A vehicle is gutted, renamed and put through the cleanup command that once destroyed a neighbour, and the unrelated checkout two folders along is untouched.
method: demonstration
demonstrates:
  - sty-nothing-i-do-reaches-what-it-came-from
verifies: "none — demonstrates: carries the edge; the containment rules are verify_method: test and are carried by tsp-a-produced-tree-is-bounded-and-named"
files:
  - none — a demonstration is observed rather than instrumented, and the Procedure below is the whole definition
---

## Scope

THE ISOLATION CLAIM, WATCHED RATHER THAN ASSERTED. A vehicle is treated the way
its owner is told they may treat it, and a neighbouring repository survives.

WHY IT NEEDS A DEMONSTRATION AT ALL, when the guards are tested. The guards
cover paths an agent NAMES through a lane verb. The incident this story comes
from involved no agent and no lane: a symlink, a package manager and a routine
cleanup command. Nothing in the battery can reach that, and a test that could
would be testing the operating system.

WHAT IS DELIBERATELY OUT. Producing the vehicle, which is
[[tsp-a-vehicle-is-made-and-then-drives-something-else]]'s first two steps. This
spec starts from a vehicle that already exists.

## Approach

THE DESIGN METHOD IS SCENARIO-BASED, and the extreme is destructive: the owner
does everything they are permitted to do, in the worst order, with the most
dangerous tool their platform offers.

THE LEVEL IS ACCEPTANCE. The pass is what a person finds in a folder they did
not touch, which no function returns.

DEPTH IS ONE PASS, on one platform, and the spec says which. A second platform
is a second run and it is not claimed by this one.

## Procedure

FIVE STEPS, and each names what is WATCHED as the pass.

- ONE. Place the vehicle in one folder. Two folders along, put an unrelated
  checkout with UNCOMMITTED WORK in it and a git history. Record both states.
  OBSERVED: the two trees share a disk and a user, and neither knows about the
  other.
- TWO. Delete a large part of what the vehicle shipped with — guidance, method
  cards, whole directories. OBSERVED: it is permitted, and nothing refuses.
- THREE. Rename the vehicle's folders and rewrite its brand file, leaving
  `instance` alone. OBSERVED: it keeps running on what is left, and the guard
  that compares identities still refuses a write back to the parent.
- FOUR. Run the platform's force-removal cleanup from inside the vehicle,
  INCLUDING the command that follows links. On Windows that is
  `git worktree remove --force`. OBSERVED: it completes, or it fails, and which
  one is recorded rather than assumed.
- FIVE. Open the neighbouring checkout. OBSERVED: its uncommitted work is
  present, its history is intact, and its working tree matches the state
  recorded at step one, byte for byte.

STEP FOUR IS THE WHOLE TEST. It names the exact command that destroyed a
repository in this house on 2026-07-25. A run that skips it has demonstrated
nothing, and the story's own aside says so.

## What this demonstration cannot settle

WHETHER EVERY PLATFORM BEHAVES THE SAME. Link-following differs between
Windows, macOS and Linux, and one run covers one of them.

AND WHETHER THE ENGINE'S OWN INTERNAL WRITES ARE CONTAINED. Those are 116 bare
joins across 49 files, measured, and they never reach the guard. A destructive
demonstration cannot find a write that simply never happened during it.
