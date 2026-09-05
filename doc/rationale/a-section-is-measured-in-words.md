---
kind: [[rationale]]
title: a section is measured in words
explains:
  - src/engine/schema.go
---

## decided

A section carries one bound, and the schema writes it once.
The unit is words.
The template's own comments are not part of the size.

## why

The size was written twice: maxWords for the editor and maxBytes for the save.
Two numbers for one fact drift, and these had, at six bytes to a word against the five this corpus actually runs at.
The two doors then disagreed about the same chapter, and a writer was marked by one and refused by the other for the same prose.

Words were chosen over bytes because a person writing a ticket counts words.
A byte count is the machine's unit.
It says nothing a writer can act on, and it moves the moment the text is not English.

The comments were taken out of the count because a comment is the template talking to the writer.
It is not prose the reader was handed, and counting it charged a writer for words the template put there.

## costs

A schema that wants a byte bound has none, and anything downstream that pays by the byte has to convert.
Every door that measures the same chapter has to count the same way, comments out, or the two disagree again.
A writer counting characters in an editor sees a different number from the one the engine holds them to.

## revisit when

- a chapter's limit has to bind bytes, because something downstream pays by the byte rather than by the word
- the corpus stops being English, and a word stops being a unit a writer can count
