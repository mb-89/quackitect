---
kind: [[rationale]]
title: the folders are read once per process
explains:
  - src/engine/store.go
---

## decided

When the roots carry a snapshot, the work folders are read once per process and every ask is answered from that copy.
A caller gets a copy of the list, a single token is read out of the snapshot, and a save drops it.

## why

Every ask opened both folders and every file in them, and a process asked many times.
The holds were read per note, one small file opened once per token, and the folder could be hundreds of them.
So the holds are read once and joined onto the list, and the list is read once and kept on the roots.

A caller that moved a token in the list it was handed moved it in everybody's list.
So the answer is a copy, and a move in a copy moves nothing else.
One token asked for by id was read out of the snapshot rather than opened again, because a process that has read the folder has no reason to open a file in it twice.

What the snapshot held was what was on disk when it was read.
A save writes after that, so the save drops the snapshot and the next ask reads the folder.
The index was told the same way, so the write was missing from neither.

## costs

A process that saves often reads the folders often, since every save drops the copy.
A snapshot is a second answer to what is on disk, true only until the next write.

## revisit when

- the index answers tokens as well as text, so no process reads the folders at all
- a save can patch the snapshot rather than drop it
