---
kind: [[rationale]]
title: the close archives the token
explains:
  - src/engine/store.go
---

## decided

The save that ends a token archives it: a tracked token goes to the archive branch and a private one is deleted.
Archivable asks the state as well as the disposition.
A reader asking for a closed token by id finds it in history, last.

## why

A token that closed came off the disk, and every caller that named its id by hand was told it never existed.
So the last place a load looks is the archive, which is a folder the reader cannot see.

The close was a thing a door did after its save, and a door forgot.
The save is where the close happens, so the save asks whether this write is the one that ended the token, and archives on that.
A save of a token already ended is a repair, and a repair does not archive twice.

The disposition alone was not enough.
A token ended where its process still declared a step was one a hand edit or an older engine had left.
Archiving it on the disposition would have taken it off the disk while its process could still move it.
So Archivable is the rule, it asks the state too, and the sweep asks the same one.

A git failure in the archive undid none of what came before.
The file was written, the record line was in and the hold was recorded, so the failure is a consequence left over, and NotArchived says so.

## costs

A closed token is reached through git, which is slower than a folder and absent where the tree is not a clone.
A private token that closes is gone, and only the record says it existed.

## revisit when

- the archive is a folder rather than a branch, so a closed token is read as the open ones are
- every process ends in a closing state, so the disposition alone can decide
