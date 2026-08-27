---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-iss-fourteen-files-reach-past-the-record-store-and-touch-its-substrate
type: "[[raid]]"
status: closed
kind: issue
statement: Fourteen engine files build a record's path themselves and read the disc, at 33 sites, bypassing the element that owns the record's content.
grade: crippling
against:
  - req-record-status-comes-from-the-record
source_refs:
  - "gate-architecture, 2026-08-26, and the owner's question about what the call sites have to do with the elements"
  - el-record-store
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

IT CARRIES A COUNT GOING TO ZERO, which is the clearest possible sign of a task.
33 sites today, 0 when it closes.

NOTHING BELOW IS WITHDRAWN. It becomes a work token when work tokens exist.

## What is open

THIRTY-THREE SITES ACROSS FOURTEEN FILES construct a record path and read it
from disc. Among them: the iteration reader, the record reader, the claim
reader, the form reader, and the start entrypoint, whose refusal text says in as
many words that the path IS the iteration.

## Why it is a boundary and not a missing element

THE RECORD STORE ALREADY OWNS THE RECORD'S CONTENT. Holding records, closing
them and keeping the archive are all its functions. "Give me this record's
content" is the same job.

SO NOTHING NEEDS INVENTING. The 33 sites ask the element that already stands,
instead of the disc.

CALLING IT A MISSING ELEMENT WOULD HAVE BEEN THE WRONG DIAGNOSIS, and it was the
first one written down. A missing element gets invented; a crossed boundary gets
routed.

## Why the fold makes it bite

TODAY EVERY SITE WORKS, because an open record and a closed one are both
folders. After the fold a closed record has no folder, so every one of the 33
must instead read the folded file or read at the recorded commit.

FOURTEEN FILES WOULD EACH LEARN THE FORMAT. Changing the fold's shape would then
mean touching fourteen files, and the shape is exactly what
[[raid-risk-a-folded-archive-no-longer-diffs-one-piece-of-work-at-a-time]] says
may want changing.

ONE FILE SHOULD KNOW IT. That is the whole argument for routing them.

## What closes it

ROUTE THE 33 SITES THROUGH THE RECORD STORE, at the build. The element now says
it owns the resolution; the code has to agree.

THE COUNT IS THE MEASURE. Sites building a record path outside the record store:
33 today, 0 when this closes.

## The trigger

AT THE BUILD, before anything writes the fold. A site left reaching the disc
after the fold ships reads a closed record as missing.
