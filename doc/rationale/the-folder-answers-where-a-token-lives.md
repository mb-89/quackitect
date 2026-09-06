---
kind: [[rationale]]
title: the folder answers where a token lives
explains:
  - src/engine/store.go
---

## decided

Where a token's file sits is the whole answer to where it belongs. No field on the note or on the process says it. A token that has a file belongs to the folder holding it. A token with no file is new, and the mint said where it is born.

## why

The process used to carry the answer, and dirFor read it on every save. A token dragged into the other store was dragged back by the next one. Moving a hundred of them meant editing the process too, which is a second edit nobody expects.

Two answers to one question is the fault. A field and a location can disagree, and when they do, nothing says which is right. Taking the field away leaves one answer that is always true, because it is the thing itself and not a description of it.

A move by hand then stays moved, which is what a move means.

The save had the same fault the other way round.
It wrote into the folder the process named and left the old file where it was, so one token became two files with one id.
The editor drew the row twice.
It cost nothing while every process agreed with the folder its tokens were already in.
It broke the day a note was converted in doc/work and saved into .se/work.
So the save removes the file it moved from, and a token has one file.

## costs

Nothing records why a token was moved. A file dragged by accident is a decision the engine honours in silence, and git history is the only trace. A tool wanting to know where a token will be born, before it exists, has to ask the mint.

## revisit when

- tokens move between folders often enough to want a verb for it
- an accidental move costs somebody work they have to undo by hand
- the mint stops being the one place a token is born
