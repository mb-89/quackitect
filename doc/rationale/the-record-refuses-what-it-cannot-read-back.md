---
kind: [[rationale]]
title: the record refuses what it cannot read back
explains:
  - src/engine/store.go
---

## decided

A save is refused when the note it would write reads back as something else.
A criterion is one line, a block holds no heading, and a heading is opened once.
The read side says a bad note out loud and still reads it.

## why

Three losses happened on the save rather than on the write, and nothing said so until a reader missed the text.
A criterion is a list item, one line, and the reader stopped at the first newline, so a second line was gone.
A block read to the next heading, so a heading inside a detail ended it early and the rest was lost.
The body was read into sections by heading, and the reader kept the last chapter under a name, so a second chapter buried the first.
The lint's half of that rule, and the case measured on wk-963dbf6898, is [[a-chapter-opened-twice-is-a-departure]].

The refusal was placed where a value becomes a line.
A refusal in a caller is a refusal the next caller does not have, and every door writes through the save.
The check reads the text the way the file will be read back off disk, by the same reader that opens a file.
So a write checked before it lands is checked as the thing that will be read afterwards.

The read side is the other way round.
A note edited by hand may break a rule, and a title that breaks it is said out loud with the token still returned.
Refusing to read work is worse than reading work with a bad title.

## costs

A save that would lose text fails whole, and the writer folds or shortens by hand.
A rule held on both sides is written twice, once as a refusal and once as a warning.

## revisit when

- the note reader keeps every line of a criterion, so a second line is no longer lost
- the editor is the only writer of tokens, and it cannot write a heading into a block
