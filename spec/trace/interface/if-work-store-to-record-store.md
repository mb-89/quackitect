---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: if-work-store-to-record-store
type: "[[interface]]"
statement: At close the work store hands its whole set of work to the record store, which folds it, and after the handover the work store owns none of it.
source: el-work-store
destination: el-record-store
carries:
  - flow-settled-work
form: one call at close, carrying every piece of work the record holds
bound: inherited — the close's own bound, and the fold is the long part of it
source_refs:
  - "gate-architecture cold review, second round, 2026-08-26"
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
  - el-work-store
  - el-record-store
---

THIS CROSSING DID NOT EXIST UNTIL THE FOLD MOVED. While the fold sat inside the
work store nothing crossed, because one element did both halves. Moving it to
the element that owns closing created the handover, and a review caught that
nothing carried it.

## What it carries

EVERY PIECE OF WORK THE RECORD HOLDS, at every status, with its identity, its
place and its terminal outcome. Not only the settled ones: a record closes over
work that moved elsewhere too, and the archive has to show that it did.

## What each side owns

THE WORK STORE OWNS THE WORK UNTIL THE CALL RETURNS. It writes nothing after.

THE RECORD STORE OWNS THE FOLDED SHAPE FROM THEN ON. It decides the file, the
boundaries between parts, and the commit it records.

## Why the direction is one way

THE RECORD STORE NEVER WRITES A PIECE OF WORK, and that is what keeps a single
writer on the work. It receives a set and writes a FILE, which is a different
act from writing an item.

## Failure behaviour

A FOLD THAT CANNOT COMPLETE LEAVES THE FOLDER STANDING. Removing the folder
before the folded file is written and committed would lose the record outright,
so the order is write, commit, then remove.

THE MIDDLE WINDOW LEAVES BOTH SHAPES STANDING, and that is survivable only
because nothing decides open-or-closed from which shape is present. The record's
own status field answers, and it travelled into the fold with everything else.
A reader keying on presence would return two answers for one record here.

SO THE ORDER IS SAFE AGAINST LOSS AND THE STATUS RULE IS SAFE AGAINST
CONTRADICTION. Neither covers the other.

AN INCOMPLETE HANDOVER REFUSES THE CLOSE. A record that cannot hand over all its
work is a record with loose ends, and closing already refuses those.
