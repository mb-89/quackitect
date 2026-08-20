---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-record-store-to-git
type: "[[interface]]"
statement: A record's tree is raised and torn down here, and the tree on disk is the contract everything else works against.
source: el-record-store
destination: nbr-git
carries:
  - flow-worktree
  - flow-open-record
  - flow-closed-record
form: child process, allowlisted verbs
bound: not one second, and it says so
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
---

## What crosses

- a worktree raised for an EXPEDITION, and torn down when it closes
- the branch a record lives on
- the landing of a closed record onto trunk

AN ITERATION NO LONGER GETS A WORKTREE (i34). It is one tree, and the
evidence stands under the root rather than inside `.worktrees/<id>/`. This
node said "a worktree raised for a record" when it was minted, which was the
same error the README carried at line 3 and which i33's verification caught
there. Expeditions still use them, which is why the flow stays.

## Measured 2026-08-17, partly

- `git worktree list`: 88 ms
- `git branch -a`: 40 ms

THE RAISE ITSELF IS NOT MEASURED. Timing it means creating a worktree and
tearing it down, which mutates the repository to answer a question, and this
edge is exercised only by expeditions. The two reads above are inside a second
and say nothing about the raise, which is the expensive half.

SO THE BOUND STANDS ON REASONING, NOT ON A NUMBER, and that is stated rather
than implied.

## Why the bound is not a second

RAISING A TREE COPIES. It is measured in seconds on any real repository, and it
grows with the repository rather than with what was asked. Demanding a second
would be a demand nobody could keep.

SO THIS IS THE SECOND PLACE A PERSON WAITS, after the battery, and it takes the
honesty half for the same reason. It is also the edge behind the slowest
entering and leaving of a record, which is a thing the owner has asked about
directly.

## Separate from if-account-to-git, deliberately

THE ACCOUNT'S EDGE CARRIES COMMITS and meets its second. This one carries TREES
and cannot. Drawing them as one interface would give a single bound that is
either wrong for commits or unkeepable for trees, and would hide which half a
breach came from.

THAT IS THE WHOLE ARGUMENT FOR MODELLING BOUNDARIES AT ALL, in one pair: the
same neighbour, two crossings, two honest bounds.
