---
kind: [[rationale]]
title: a note is written for its readers
explains:
  - src/engine/store.go
---

## decided

A relation between tokens is written as a link, because the editor walks it.
A flag that is off is not written, because a person skips it.
The writer shapes the note for the two readers it has.

## why

depends_on and parent were written as bare ids.
The schema said x-link on both fields, so the editor was promised a walk, and the walk had nothing to follow.
The x-link was a claim about a behaviour that was not there.
Writing the link where the value is written keeps the promise, and the reader takes the bare name inside as the value.

The other reader is a person.
urgent and needs_human were written on every note, false on nearly all of them.
False on every note is a line the reader learns to skip, and a reader who skips lines skips the true one.
So a flag that is off is left out, and its absence means off.

## costs

A list written before links were written reads as bare names, so the reader accepts both spellings for ever.
A reader that does not know the flags cannot tell off from not yet decided.

## revisit when

- the editor walks a bare id as it walks a link, so the brackets carry nothing
- a flag gains a third value, so absence stops meaning off
