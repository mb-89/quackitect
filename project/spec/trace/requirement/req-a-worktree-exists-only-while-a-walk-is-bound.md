---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: req-a-worktree-exists-only-while-a-walk-is-bound
type: "[[requirement]]"
statement: The engine shall hold a worktree on disk for an iteration only while a walk on that machine is bound to it.
kind: functional
characteristic: functional-suitability
verify_method: test
breaks_if_removed: A folder stops meaning anything, so the disk and git disagree about which iterations are open and a finished iteration blocks everything that depends on it.
breaks_how_badly: crippling
refines:
  - uc-start-an-unattended-machine
source_refs:
  - uc-start-an-unattended-machine step 5
  - uc-close-a-record
  - raid-a-close-that-removes-the-folder-destroys-uncommitted-work
  - raid-sweeping-the-folders-early-hides-every-seeded-iteration
  - raid-a-crashed-walk-leaves-a-folder-that-means-nothing
priority: must
---

## Detail

THREE TRANSITIONS, AND EACH ONE BINDS.

| moment | what happens to the folder |
| --- | --- |
| seeding | none is created; the iteration lives on its branch only |
| entering | it is created at that moment, from the branch |
| closing | it is removed, after the tree is committed or the close refuses |

THE CLOSE COMMITS OR REFUSES, NEVER REMOVES BLIND. A clean tree is removed. A
dirty tree is committed to the iteration's own branch first. Where neither is
possible the close refuses and names what stands in the way.

THAT RULE IS A MEASUREMENT, NOT A PRECAUTION. The folder that provoked this
work held 34 uncommitted paths, and they were known to be duplicates only after
a byte-for-byte comparison.

## Behaviour

    (nothing)  -> seeded:    the seed pushes the branch, no folder
    seeded     -> bound:     a walk enters, the folder is created
    bound      -> seeded:    the walk leaves without closing, folder removed
    bound      -> shipped:   the close commits or refuses, then removes
    shipped    -> (archive): read from git on every machine, no folder anywhere

THE FIRST LINE IS THE ONE THAT PAYS. Nothing creates a folder at seeding, which
is the whole change: today seeding creates one and nothing ever removes it.

THE PARTICIPANT TEST leaves one hole open deliberately. A walk that dies leaves
a folder no transition removed, and this row does not close that. It is
[[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]], and its answer is
expected to live in the claim rather than the folder.
