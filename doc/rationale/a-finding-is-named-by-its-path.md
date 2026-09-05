---
kind: [[rationale]]
title: a finding is named by its path
explains:
  - src/engine/schema.go
---

## decided

A lint finding over a folder is named by the file's path relative to the folder walked, written with slashes.
The bare file name is never the id.

## why

The lint walked a folder all the way down and named each finding by the file's name.
Two files called guidance.md sat in the corpus, one at the top and one in a lane's folder.
They were two findings a reader had to be able to tell apart, and the name said nothing.
A reader fixing one opened the other.

The path from the folder walked was the shortest name that told them apart.
It is written with slashes whatever the platform, so a finding reads the same on every box and a test can match on it.
The full path stays on the finding beside the id, for an editor that opens the file.

## costs

A finding's id is longer than a file name.
It depends on which folder the walk started at, so the same file has two ids from two walks.

## revisit when

- every note in a corpus carries a name that is unique across the whole tree, so the file name alone tells findings apart
- readers use the finding's file field and never its id, so the id can go back to a short name
