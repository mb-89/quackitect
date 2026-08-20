---
minted_in: i27
id: req-record-status-comes-from-the-record
type: "[[requirement]]"
statement: The engine shall read a record's status from the record itself, and shall resolve the archive through git, so that every machine shows the same record in the same state.
kind: functional
verify_method: test
breaks_if_removed: What counts as open depends on what happens to exist on one machine's disk, so two machines disagree about the same record and neither is wrong.
breaks_how_badly: crippling
refines:
  - uc-browse-the-archive
source_refs:
  - uc-close-a-record
  - uc-open-an-iteration
  - "observed: a fresh clone showed all nineteen pushed records as archived, none ever started"
  - "owner ruling 2026-08-13: status comes from the record, the archive looks up through git, a finished record's worktree is deleted"
priority: must
---

## Detail

TODAY A RECORD COUNTS AS OPEN IF ITS WORKTREE DIRECTORY EXISTS, and the
archive is everything not open.

That separates seeded from finished on one machine only because seeding
happens to create a directory there. IT ALREADY FAILED ON A PEER: a
fresh clone showed all nineteen pushed records as archived, none ever
started.

AND IT FAILS HERE THE MOMENT A PRODUCT STOPS MAKING WORKTREES, because
then every record is not-open and the archive swallows the one being
walked.

## The three parts, and they are one idea

- STATUS COMES FROM THE RECORD, which already carries it.
- THE ARCHIVE RESOLVES THROUGH GIT, for expeditions exactly as for
  iterations. That is the whole point of retiring a record to its branch.
- A FINISHED RECORD'S WORKTREE IS DELETED. Done work keeps no folder.

## Why it rides this iteration

It is not the same idea as where a path resolves. It rides because the
binding BREAKS the old model - and because both halves touch the same
three call sites, so doing them apart means reading the same code twice.

## Behaviour

A LIFECYCLE EARNED ITS PLACE and is owed at design: seeded, started,
shipped, retired - with the question of which transitions a peer can
observe without the worktree being the reason this row exists.
