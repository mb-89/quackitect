---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-archive
type: "[[test-spec]]"
statement: The archive lists every closed record, opens to a person only, shows each record as it closed, and holds nothing writable, verified by test over the archive machinery.
method: "test"
verifies:
  - "req-archive-lists-every-closed-record"
  - "req-archive-opens-to-a-person-only"
  - "req-archive-read-only"
  - "req-archive-releases-worktrees"
  - "req-archive-shows-it-as-it-closed"
files:
  - "tests/archive.test.ts"
  - "tests/container.test.ts"
  - "tests/threshold.test.ts"
---

## Scope

The closed-record surface: listing, person-only entry, byte-faithful
display from the record's own branch, the read-only wall, and the
worktree release at close.

## Approach

Component level. The person-only and threshold claims probe the gate at
every slider setting. Three claims are DEFINED here ahead of their
cases and land as named cases in archive.test.ts with the builds that
close them: the edit-refusal on an archived record, the worktree
release leaving zero references, and the byte-exact open (today the
branch-read mechanism is tested; the byte claim is not asserted
directly).

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: a closed record is read from its branch
once, then cached; the archive: start reaches every closed expedition,
each runs to end, browsing is human-only; the gate weighs the TARGET:
the archives wait at ANY slider.
