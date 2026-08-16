---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-a-crashed-walk-leaves-a-folder-that-means-nothing
type: "[[raid]]"
kind: assumption
statement: The rule that a folder on disk means somebody is working that iteration right now holds only while every walk ends through the close, and nothing yet removes a folder left by a walk that died.
owner: the driving agent
trigger: the first crash, kill or power loss during a bound walk, and any design of the close path
status: open
impact: The whole lifecycle rests on the folder meaning one thing. A crashed walk leaves a folder that means nothing, and the machine cannot tell it from a live one. On a cloud machine that is the expected ending rather than the exceptional one, because the container simply stops.
breaks_how_badly: corrosive
how_likely: expected
probe: "scheduled. Kill a bound walk, look at disk and container. No M3 state grants se_run, so M6 carries it."
probed: "2026-08-15"
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - raid-sweeping-the-folders-early-hides-every-seeded-iteration
weighs_with: <!-- a pool id, then why the two measure the same thing. Or none. -->
weighs_against: <!-- one line per pair — a pool id, then > or = -->
---

## Probe

KILL A BOUND WALK AND LOOK. Start an iteration, terminate the process without
letting it close, then ask the container what it shows and ask the disk what
is there.

THREE ANSWERS ARE POSSIBLE and they are not equally good.

- The folder is gone. The rule holds and there is nothing to build.
- The folder stays and the container calls the iteration live. The rule is
  broken, and the claim is the thing that must expire rather than the folder.
- The folder stays and the container reads git, so the iteration shows
  correctly and the folder is only litter. The rule is bent, not broken.

WHAT WOULD FALSIFY THE STATEMENT: the second answer, on any platform.

## Why it was not caught earlier

BECAUSE THE RULE WAS STATED AS A DEFINITION RATHER THAN AS A GUARANTEE. "A
folder means somebody is working it right now" is true of every folder the
system creates deliberately, and says nothing at all about folders left
behind.

## Where the answer probably lives

NOT IN THE FOLDER, IN THE CLAIM. The claim ledger already knows who holds an
iteration and already exists in engine/claims.ts. A claim that can go stale,
with the greyed display naming its holder, answers this without the folder
ever having to be trustworthy.

That is a direction rather than a decision, and it belongs to M4 or M5.

## Provenance

FOUND BY THE RED-TEAM ROUND at i28's motivation gate on 2026-08-15, and
written one state later because a gate could not write.

THAT DELAY IS ITSELF RECORDED as the case behind the owner's ruling of the
same day that every gate must be able to write. This entry is the evidence
that the restriction cost something real.
