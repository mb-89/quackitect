---
form: raid-tripwire-i16-a-structural-migration-cannot-be-written
by: agent
signed_off: 2026-08-18T16:06:17.486Z
authors: agent
files:
---

# Evidence form / raid-tripwire-i16-a-structural-migration-cannot-be-written

## current_situation

SPIKE ANSWER: THE TRIPWIRE DOES NOT FIRE, AND THE WINNER'S ADVANTAGE IS MUCH SMALLER THAN IT WAS SCORED. Closed at 8 of 15 lane calls.

### What was probed, and why it could fail this time

THE EARLIER PROBE'S PROGRAM ARM COULD NOT FAIL. It was a text substitution checked for its own effect, with no repository, no merge and no failure mode available. The tripwire says exactly that.

THIS ONE USED A REAL STRUCTURAL CHANGE: the rename this iteration actually performed. `bring-forth-a-copy` to `bring-forth-a-vehicle` moved a file, changed an identity inside it, and touched every citer. Two throwaway repositories, three commits each, both run 2026-08-18. exp-a-structural-rename-across-a-vehicle carries the runs.

### Git handles the realistic case completely

A TWENTY-LINE NODE, upstream renaming the file and changing two lines, the vehicle adding a section: `Auto-merging`, `Merge made by the 'ort' strategy`, MERGE_EXIT=0. One file, upstream's new identity, and the vehicle's added section still in it. Nobody resolved anything.

### Git fails only where similarity collapses

A THREE-LINE NODE with two of three lines changed: `CONFLICT (modify/delete)`, MERGE_EXIT=1, and BOTH files left in the tree. The renamed one without the vehicle's restructuring, and the vehicle's own still claiming the OLD identity. The corpus then holds two nodes for one thing.

WHAT DECIDES IT IS A THRESHOLD. Git's rename detection is similarity-based, 50 per cent by default. Two lines of three is 33 per cent and the rename is missed. Two of twenty is 90 per cent and it is found.

THE CORPUS SITS ON THE SAFE SIDE. Trace nodes run 40 to 130 lines and a typical upstream edit is a few lines.

### So both halves of the answer are yes

A STRUCTURAL MIGRATION CAN BE WRITTEN AS A PROGRAM. "Rename this identity, and the file follows" addresses the node rather than the path, and neither run's restructuring would have troubled it. The tripwire's falsifier is not met.

AND GIT ALREADY ANSWERS THE CASE THE CORPUS ACTUALLY HAS. The program route's advantage is one nameable situation: a short node that upstream largely rewrites.

### Which is the cell the whole iteration turned on

cand-the-program-route BEAT cand-everything-declared 4 TO 3 on req-overlay-survives-update, and reverse-sensitivity computed that as the ONLY cell that flips the seat. This spike says the axis is narrower than the score assumed.

THE OWNER SAID THE SAME THING FROM THE OTHER DIRECTION on 2026-08-18: "Are you really gonna implement your own merge system? Why not use git for that?" and "this is not the most important feature to me". note-beac84587cd9 records it.

## built

- exp-a-structural-rename-across-a-vehicle

## follow_up

FOLD-BACK OWNS THE RULING, and this spike hands it a specific question rather than a mood.

### The question fold-back must answer

DOES req-overlay-survives-update STILL SEPARATE THE TWO CANDIDATES BY A FULL POINT, now that the winner's advantage is bounded to short nodes that upstream largely rewrites.

IF IT DOES NOT, the seat is a tie and cand-everything-declared is level. If the axis is re-weighted downward, cand-nothing-but-a-channel comes back into range at two cells behind.

RE-DECIDING MEANS REOPENING converge-pugh AND EVERYTHING BELOW IT. That chain has been re-earned twice today and each pass is mechanical.

### What this spike deliberately did not probe

THE OTHER HALF OF THE ROW. req-overlay-survives-update has two measures: forced overlay edits per update, and silent fallbacks to engine defaults where the overlay rules. Only the first was probed. The second is about resolution, not merging, and nothing here touches it.

AND THE COLLISION CASE THE USE CASE LEGALISES. uc-vendor-and-overlay extension 3a lets a vehicle edit a shipped file in place. Neither run tested what happens when the vehicle's edit and the update's instruction land on the SAME line.

### What it changes for M7 regardless of the ruling

IF THE PROGRAM ROUTE STANDS, its format now has a bounded job: it must handle identity renames, and it can lean on git for everything git already merges. That is a much smaller format than one which has to carry every change.

IF IT DOES NOT STAND, el-update-runner becomes a thin wrapper over a git merge plus a report, and raid-asm-a-vehicle-owner-reads-the-update-diff loses most of its force, because a git conflict is loud where a silent wrong migration is not.

EITHER WAY THE OWNER'S STEER HOLDS: getting a vehicle running is the goal, and the update mechanism is cheaper than M4 assumed.

## anything_else

