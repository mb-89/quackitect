---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-sweeping-the-folders-early-hides-every-seeded-iteration
type: "[[raid]]"
kind: risk
statement: Sweeping the iteration folders before the open test moves to git hides every seeded iteration from the container at once, because today the container reads open from the folder existing.
owner: the driving agent
trigger: any of the four lifecycle steps landing out of order, and specifically the sweep landing before the open test
status: open
impact: 27 iterations vanish from the container's offer in one act. Nothing is deleted from git, so the damage is recoverable, but the machine reports no work available and the cause is invisible from any surface.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - raid-asm-git-answers-open-without-a-worktree
---

## What it is

The container's open test is `open: existsSync(path)` at
project/deliverable/engine/iterations.ts line 71. Removing a folder therefore
removes the iteration from the offer, whatever its record says.

That is not a theory. It is the same mechanism that blocked i28's own entry
from the other direction: i27 had shipped and its folder remained, so the
container held i27 open and refused to draw i28's door.

## The order that must hold

1. The open test moves to the record's status, read from git.
2. Entering a git-only seed materialises its folder at that moment.
3. The close removes the folder.
4. Only then is the disk swept.

STEPS 1 AND 2 LAND TOGETHER. Moving the open test without materialising on
entry leaves every seed visible and unenterable, which is the same failure
wearing the opposite costume.

## Why plausible rather than conceivable

The owner asked for the sweep and the fix in one breath on 2026-08-15, and the
sweep is the easiest of the four to do first because it needs no code. An
order that is obvious to whoever wrote it down is not obvious to whoever picks
the work up.

## The mitigation

The order is written into i28's record as a numbered sequence with the reason
attached, and this entry exists so the reason survives the record.
