---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-the-fold-runs-at-close-on-the-process-that-serves-the-surface
type: "[[raid]]"
status: closed
kind: risk
statement: The fold runs when a record closes, on the same process that serves the surface, and no element holds it in the background.
grade: corrosive
against:
  - req-a-slow-answer-does-not-freeze-the-surface-beside-it
source_refs:
  - evaluate-architecture, the ATAM walk
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
  - "owner ruling 2026-08-26: it belongs in a background task"
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

THE OWNER HAD ALREADY RULED ON IT: the fold belongs in a background task. A
thing with a ruling and a known fix is work, not a risk.

NOTHING BELOW IS WITHDRAWN. Only its home was wrong. It becomes a work token
when work tokens exist.

## The hinge

WHERE THE FOLD RUNS IS THE HINGE. Closing a record reads every file the record
holds, writes one, and removes the folder. The surface is served from the same
process.

## What the row demands

A REQUEST ELSEWHERE IN THE ENGINE MAY RUN PAST ITS BOUND, and the surface must
answer its own requests as usual. A synchronous fold breaks that for as long as
it runs.

## The size of it, measured

ONE ITERATION IS SMALL. The whole archive is 68 folders and 1,312 files, so a
single record's fold is tens of files rather than thousands.

THE MEASURED FIGURES ARE FOR THE WHOLE TREE, not one record: `git add` 26,073 ms
unfolded against 97 ms folded, at 20,000 files. A single close is far below
that.

SO THE EXPOSURE IS SMALL AND UNMEASURED. That is what makes it a risk rather
than a defect.

## The owner has already ruled

THE RULING IS THAT IT BELONGS IN A BACKGROUND TASK. The structure names no
element that holds one, so the ruling stands ahead of the design rather than
inside it.

## The trigger

IT FIRES AT THE BUILD STEP THAT WRITES THE CLOSE PATH. That step either puts
the fold in the background or records why it did not.
