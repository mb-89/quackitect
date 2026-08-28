---
minted_in: i9
id: raid-risk-an-existing-checkout-keeps-its-state-where-the-move-left
type: "[[raid]]"
kind: risk
statement: Anybody who already has this repository checked out keeps their machine-state folder at the old location, because it is ignored by git and the move cannot reach it.
owner: the driving agent
trigger: the first time somebody pulls the commit that moves the folder into an existing checkout
status: accepted
impact: The engine looks in the new place, finds nothing, and reads that as a tree nobody has ever driven. The call log, the notes and the session state are all still on disk one level up, and nothing says so.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - the ignore file excludes the folder, so no commit can carry it
  - raid-risk-a-path-that-resolves-the-machine-state-folder-is-missed, which is the same silent failure from the code's side
---

## What happens

THE MOVE IS A COMMIT. Somebody with an existing checkout pulls it, and git
relocates every tracked file exactly as intended.

THE MACHINE-STATE FOLDER IS NOT TRACKED. It is ignored, so no commit mentions
it, so nothing moves it. It stays where it was.

THE ENGINE THEN LOOKS IN THE NEW PLACE and finds nothing.

## Why that is worse than an error

ABSENCE IS A LEGAL STATE. A folder nobody has driven has no machine-state
folder, and the system now treats that as meaning it is not a project.

SO A LONG-DRIVEN TREE LOOKS EXACTLY LIKE A FRESH ONE. The history is on disk,
one level up, and nothing points at it.

AND IT IS CERTAIN RATHER THAN LIKELY. Every existing checkout hits this, by
construction, the first time it pulls.

## It is the same shape as the code-side risk, from the other end

THE CODE RISK is that a caller keeps pointing at the old location. THIS one is
that the DATA stays at the old location. Both end in a quiet empty answer, and
they will be met on the same afternoon.

## ACCEPTED, WITH A MANUAL MIGRATION (owner ruling 2026-08-19)

THEIR RULING, in their own words: this concerns only this project, on two
machines. That is acceptable and it is not a showstopper. No mechanism is to
be built. What is wanted is a migration strategy that can be done by hand.

SO NOTHING IS BUILT FOR THIS. The three shapes considered are recorded below,
and the third is the one taken.

- A ONE-TIME MIGRATION at start-up, moving the folder automatically. NOT TAKEN.
- A LOUD REFUSAL that stops and tells the person to move it. NOT TAKEN.
- ACCEPT IT AND MIGRATE BY HAND. TAKEN, on the ruling above.

## The migration, per machine that already has a driven checkout

DO IT WITH NOTHING RUNNING. Close the editor and stop the lane first, so no
process is holding the old path open.

1. PULL the commit that lands the move.
2. MOVE THE MACHINE-STATE FOLDER from its old place at the repository root into
   the folder that gets opened. One folder move, by hand.
3. THE BUILT-PACKAGES FOLDER IS ALSO IGNORED and will also be left behind.
   Move it or delete it — it rebuilds, so either is safe.
4. OPEN THE FOLDER and start. The call log, the notes, the declared roots and
   the handover are all where the engine now looks.

## How to tell it worked

ASK THE LOG FOR YOUR OWN HISTORY. One query. It answers with the record of
what this machine has done, rather than with nothing.

AN EMPTY ANSWER MEANS THE MOVE WAS MISSED, and that is the only symptom there
is, which is why the check is worth making rather than assuming.

## Forgetting it destroys nothing

THE OLD FOLDER IS STILL THERE. Nothing deletes it, so a missed migration is
recoverable at any point.

THE ONLY CARE NEEDED: a fresh empty folder may have been created in the
meantime. Delete that one first, then move the real one into place. Otherwise
two histories sit side by side and neither is complete.

## Why the exposure is small enough to accept

THE MACHINE DOING THE WORK IS NEVER AFFECTED. The move is a local file
operation there, so the agent relocates the folder as part of the change.

A FRESH CLONE IS NEVER AFFECTED. It has no old folder and creates one in the
right place.

IT TAKES A SECOND MACHINE WITH AN ALREADY-DRIVEN CHECKOUT, and there is one.

## Where it came from

THE HOSTILE FAQ AT M1 asked what happens to somebody who already has a clone.
The question had no clean answer, so it folded here, which is what that state
exists to do.
