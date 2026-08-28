---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-three-guards-match-a-folder-path-and-a-closed-record-no-longer-has-one
type: "[[raid]]"
status: closed
kind: risk
statement: Three standing must rules find a closed record by its folder, and after the fold a closed record has no folder for them to find.
grade: fatal
against:
  - req-archive-read-only
  - req-a-records-own-status-decides-whether-it-is-open
  - req-a-shipped-record-is-never-reclaimed
source_refs:
  - gate-architecture, the program sweep of all 267 functional requirements
  - scratchpad/sweep-functional-rows-the-fold-touches.mjs
  - raid-iss-a-functional-requirement-the-design-touches-is-dealt-nowhere
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

## CLOSED AS WORK, NOT AS A FINDING — 2026-08-26

THE FIX IS THE SAME FIX AS THE CALL SITES, and it is ours. Three guards asking
the element that owns a record instead of the disc is a task.

NOTHING BELOW IS WITHDRAWN, and the read-only guard failing open is still the
sharpest thing in it. It becomes a work token when work tokens exist.

## The hinge

A RECORD CLOSED FROM NOW ON IS A SINGLE FILE. Anything that finds a closed
record by its folder path stops finding that one.

THE 68 ALREADY ARCHIVED KEEP THEIR FOLDERS (owner ruling, 2026-08-26). There is
no migration.

THAT MAKES THIS SMALLER AND MORE PERMANENT AT ONCE. Nothing already working
breaks on day one, which is the smaller half. And both shapes stand forever
rather than for the length of a migration, so a reader that handles only one is
wrong for good rather than wrong for a while.

## The three, and what each stops doing

THE READ-ONLY GUARD. An edit targeting an archived record must be refused. A
guard matching a folder path matches nothing after the fold, so the edit is not
refused — it lands. That is the worst of the three, because failing open on a
guard looks exactly like passing.

THE OPEN-OR-NOT DECISION. Whether a record is open is decided from that record's
own status field. After the fold the field sits inside the folded file, and it
has to be readable without unfolding the whole thing to answer one question.

THE SHIPPED-RECORD REFUSAL. Entry to a shipped record is refused from every
machine, and it reads status off the record the same way.

## Why they share one entry

ONE CAUSE, THREE SYMPTOMS. Each finds a record by its shape on disc, and the
shape changed. Splitting them into three entries would hide that fixing the
resolution once fixes all three.

THE FIX IS THE SAME FIX AS THE CALL SITES. Routing every record read through the
element that owns a record's content is what makes all three shape-blind. See
[[raid-iss-fourteen-files-reach-past-the-record-store-and-touch-its-substrate]].

## Why this is graded fatal

THE HIGHEST GRADE AMONG THE THREE CARRIES THE ENTRY. The read-only guard is
graded fatal and is a must, and a guard that fails open is not a degraded guard.

## What would close it

THE ELEMENT ALREADY CLAIMS IT. The record store says it resolves a record
whichever shape that record is in. When the three ask it instead of the disc,
they stop caring about the shape.

THE STATUS FIELD NEEDS ONE MORE THING: reachable without reading the whole
folded file. That is a demand on the fold's shape, and it joins the ones the
fatal archive row already makes.

## The trigger

AT THE BUILD, before the fold ships. A guard left matching a folder path after a
closed record has none is a rule that reports a guarantee it does not have.
