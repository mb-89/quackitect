---
minted_in: i1
id: tsp-archive
type: "[[test-spec]]"
statement: The archive lists every closed record, opens to a person only, shows each record as it closed, and holds nothing writable, verified by test over the archive machinery.
method: test
verifies:
  - req-archive-lists-every-closed-record
  - req-archive-opens-to-a-person-only
  - req-archive-read-only
  - req-archive-shows-it-as-it-closed
  - req-a-closed-records-folder-stays-on-trunk
files:
  - tests/archive.test.ts
  - tests/container.test.ts
  - tests/threshold.test.ts
---

## Scope

The closed-record surface: listing, person-only entry, byte-faithful display,
and the read-only wall.

## Approach

Component level. The person-only and threshold claims probe the gate at every
slider setting. Two claims are DEFINED here ahead of their cases and land as
named cases in archive.test.ts: the edit-refusal on an archived record, and the
byte-exact open.

## Steps

Every case in the referenced files is one step; the case name states its claim.
The load-bearing steps: a closed record is read from its folder on trunk; the
archive: start reaches every closed record, each runs to end, browsing is
human-only; the gate weighs the TARGET — the archives wait at ANY slider.

## What i34 removed from this spec

THREE MECHANISMS IT DESCRIBED ARE DELETED, and each was in the text above.

- "byte-faithful display FROM THE RECORD'S OWN BRANCH" — there are no branches.
  The display is byte-faithful because it reads the file.
- "the worktree release at close", which was also one of its three defined
  claims — there is no worktree to release, and
  req-archive-releases-worktrees is retired.
- "a closed record is read from its branch once, then cached" — the folder
  stays on trunk, so the filesystem is the cache and there is no branch read.

WHAT THE SPEC STILL VERIFIES IS THE PART THAT MATTERED. A closed record can be
browsed exactly as it stood, only by a person, and never edited.
