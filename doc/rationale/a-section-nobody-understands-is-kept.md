---
kind: [[rationale]]
title: a section nobody understands is kept
explains:
  - src/engine/store.go
---

## decided

The engine writes the whole body of a token, one section under each heading it owns.
A section under any other heading is kept whole and written back where it was.
Not understanding a section is not a reason to delete it.

## why

The file was rendered from the struct on every save.
A heading nothing matched went nowhere, and the next save rebuilt the file without it.
A person who wrote a section by hand lost it the next time any door touched the token, and nothing said so.

The struct now carries what it does not understand as kept sections, head and text, and writes them back after its own.
The engine still owns the body.
Every section it knows is rendered from the fields, so a hand edit to those is read and rewritten in the engine's shape.
What it does not know it does not touch.

## costs

A kept section is weighed as written and never checked, so a bound on it is the schema's alone.
Its place in the file is after the engine's sections, wherever it stood before.

## revisit when

- the schema declares every section a token may carry, so an unknown heading is a departure rather than a keepsake
- a person edits tokens only through the editor, which knows the sections
