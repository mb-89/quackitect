---
kind: [[rationale]]
title: the line says what happened
explains:
  - src/engine/store.go
---

## decided

A record line names the move it is about. It says minted, or it says the state it came from and the state it went to. Nothing downstream works that out from the fields the line happens to carry.

## why

The burn-down did work it out, and read nought for ever.

It counted a mint by looking for a line that had a status and no from. It counted an ending by looking for a disposition. Neither key was ever written, so both numbers were nought for every day there has ever been.

Nothing said so. Nought is a number a burn-down is allowed to answer. A reader had no way to tell a quiet week from a reader that never matched a line. A count that cannot fail is not a count.

The writer knows which move it is making. It is in the switch that decides what to write. Saying it there costs one field and removes every guess after it.

## costs

A reader that wants a move the writer does not name has to have the writer changed. Two places now describe the same move, the words of the line and the fields beside it, and they can drift.

## revisit when

- a second reader wants a move this does not name
- the words and the fields disagree in the record
- a count somewhere else is derived rather than written
