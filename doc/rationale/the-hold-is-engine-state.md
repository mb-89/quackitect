---
kind: [[rationale]]
title: the hold is engine state
explains:
  - src/engine/store.go
---

## decided

The hold, who has a token in hand on this box, is kept by the engine under .se and never written into the note.
The claim, which other boxes need, is written into the note that travels.
A holder found in a note is not read.

## why

The holder was written into the note as an ordinary field.
A take-up that was never put down left a name in a file nothing reopened.
The agent was gone and the session was gone, and the name stayed, so the queue showed work in hand that nobody held.
Notes written in that period still carry such a name.
Reading it would put a dead hand back on live work, so there is no field to read it into.

The hold moved to holdstore.go under .se, where a hold can be dropped when the agent holding it is gone.
The one place that moves a token is the save, so the save is the one place that has to remember the hold.
It is the same place that used to put the name on the page.

The claim was different.
A hold is this tree's own, and a claim is for the other boxes, which read the tree out of git.
So the claim goes in the note that travels, and the hold does not.

## costs

A note read cold says who claimed it and never who holds it, so a person at the panel asks the engine.
Two stores, one for holds and one for claims, answer the one question of who is on this from two sides.

## revisit when

- a hold can be attributed to a live session by the engine, so a stale name cannot survive its owner
- boxes share one engine, so a claim and a hold become one thing
