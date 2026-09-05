---
kind: [[rationale]]
title: a lint reads the whole tree
explains:
  - src/engine/schema.go
---

## decided

The lint walks a note folder all the way down.
A folder parked with a leading underscore is skipped whole, and so is everything under it.
A folder that is not there has nothing to read and is not a finding.
A folder that is there and will not read is one.

## why

It read one level and skipped every directory, so doc/guidance was checked and doc/guidance/software-development was not.
Three lane files and a fourth under engine_design_principles had never been read by anything.
The schema they name applied to them exactly as much as to any other file, and nothing had ever asked.
A check that reads the top of a tree reports on the tree.
That is how a folder becomes the place unchecked things go.

Parking is how a file is taken out of the engine's way.
A folder named with a leading underscore takes everything under it out too.
That is what makes parking a thing you can do to a whole lane rather than to one note.

The walk was written with os.DirEntry and filepath.SkipDir rather than the io/fs spelling.
This package already has a function called fs, the one that reads a frontmatter field.
One name, one thing.

A working copy may carry no argument yet, and an empty shelf was not made a fault.
A folder that was there and would not read stayed one.
That is the case where a clean answer would otherwise be given about notes nothing had opened.

## costs

A parked folder is invisible to the lint, so a note parked by accident is never checked and nothing says so.
A missing folder and an empty one answer alike, so a corpus that has gone reads as a corpus with nothing in it.
Walking costs a stat per entry on every lint rather than one read of one directory.

## revisit when

- a parked folder has to be checked anyway, and parking stops meaning taken out of the engine's way
- a missing note folder becomes a fault worth reporting, because something downstream depends on it being there
