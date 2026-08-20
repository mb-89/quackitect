---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-a-close-that-removes-the-folder-destroys-uncommitted-work
type: "[[raid]]"
kind: risk
statement: A close that removes an iteration's folder destroys whatever was never committed in it, and the folder that provoked this rule held 34 uncommitted paths.
owner: the driving agent
trigger: the first close after the folder removal lands, and again at the disk sweep
status: open
impact: Work disappears with no trace and no recovery, because the folder is removed rather than merged. The branch keeps only what was committed, so anything a walk left uncommitted is gone.
breaks_how_badly: fatal
how_likely: expected
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - note-9391416c6203
---

## What it is

i27's leftover folder was retired on 2026-08-15 and it held 34 uncommitted
paths at the moment of removal. Every one turned out to duplicate trunk, and
NOBODY KNEW THAT UNTIL THEY WERE CHECKED BYTE FOR BYTE.

- 23 identical to trunk's committed content.
- 9 identical to trunk's working copy.
- 2 generated files whose only difference was a stale hash stamp.

So the removal was safe, and it was safe by measurement rather than by design.

## Why it is expected rather than conceivable

note-9391416c6203 already records the same family from the other side: every
commit path uses `git add -A`, but the session only commits at a reload, so
eight files i27 created sat untracked for a whole iteration. Uncommitted
content in a record's tree at close is the normal state, not the exceptional
one.

## The mitigation, which is a design rule rather than a watch

THE CLOSE COMMITS OR REFUSES. It never removes blind.

- Clean tree: remove it.
- Dirty tree: commit to the record's own branch first, then remove.
- Cannot commit: refuse, and name what stands in the way.

THE SWEEP CARRIES THE SAME RULE, multiplied by however many folders it walks,
and it reports every folder it skipped rather than skipping quietly.

`git worktree remove` already refuses a dirty tree by default. Reimplementing
the question with a directory delete is what would lose the refusal.
