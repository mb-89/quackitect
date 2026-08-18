---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: tsp-two-machines
type: "[[test-spec]]"
statement: Two machines each clone the repository and each walks a different iteration to a gate, verified by demonstration — and the collision case is named as undemonstrable rather than passed.
method: demonstration
demonstrates:
  - sty-work-on-two-machines
verifies:
  - req-one-command-starts-an-unattended-machine
files:
  - none — the procedure below is the definition; the observed sessions are the evidence
---

## Why this spec exists

i34 DELETED THE SPEC THAT CARRIED THIS STORY. `tsp-claim-lane` went with the
claim ledger, and it was the only demonstration naming
`sty-work-on-two-machines`. The story is a `must` and stayed live, so deleting
its demonstration left a must story nothing demonstrates.

THE COVERAGE LAW CAUGHT IT AT gate-validation, three states after the deletion.
That is the same shape as the requirements orphaned when a function was
deleted, and it is worth recording that the deletion warned nobody at the time.

## Scope

What the story actually promises: an engineer seeds a batch at the desk, opens
a second machine, and each walks its own iteration. Two shipped in the time one
used to take.

WHAT IS DELIBERATELY OUT: claiming. There is no claim ledger, so no machine
claims an iteration and none is refused one.

## Approach

System level, on two real machines with the repository cloned to each. Not
staged: the second machine is one nobody configured for this, which is the
slide the story kept when the separate cloud story was withdrawn.

## Procedure

1. Seed two iterations at the desk on machine A. Commit and push.
2. Clone the repository on machine B.
3. On machine A, enter the container and choose the first iteration. Observe
   that the pull carrying no choice offers the doors and enters nothing.
4. On machine B, enter the container and choose the SECOND iteration.
5. Walk each to its next gate. Observe that neither walk sees the other's
   unlanded work, because the two are separate clones.
6. Land both, in either order, and observe that each machine's record folder
   arrives on trunk intact.

## What this demonstration CANNOT show, and why it says so

TWO MACHINES GIVEN THE SAME ITERATION WOULD BOTH WALK IT, SILENTLY. Nothing
refuses the second. That was the claim ledger's whole job and the ledger is
gone, by the owner's decision recorded at
`raid-dec-one-tree-beats-a-record-travelling-between-machines`.

SO STEP 4 IS AN INSTRUCTION, NOT A GUARANTEE. The procedure says choose a
different iteration because the system will not stop you choosing the same one.
A demonstration that quietly skipped the collision case would report a safety
this system does not have.

THE HONEST STATE OF THE STORY: the happy path is demonstrable and the failure
path is not defended. Anyone reviving machine-to-machine work owes the refusal
back, and the decision node records that it can return without worktrees —
the ledger worked on refs through a temporary index and never touched a working
tree.

## Not yet performed

THIS PROCEDURE HAS NOT BEEN RUN. i28's own validation gate passed with an
override saying the mechanism existed and no rented host had ever run it, and
i34 did not change that. The spec defines how the story is demonstrated; it
does not claim the demonstration happened.

`raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make` carries the
reason it has not been.
