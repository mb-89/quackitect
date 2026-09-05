---
kind: [[rationale]]
title: a field is read or gone
explains:
  - src/engine/store.go
  - src/schemas/work-token.schema.yaml
---

## decided

A work token carries a field because something reads it.
A field nothing reads comes out, whatever it once served, and a new one waits for its reader.

## why

The old token carried 28 fields and nothing said which of them anybody read.
Eleven served a reviewer who is gone.
id repeated the file name, type repeated kind, traced repeated the folder, and assignee repeated holder.
seq recorded when a token was typed, and then let a queue read it as what to do next.
An order somebody decided is depends_on.

Each of those was added for a reason that held when it was added, and each outlived that reason quietly.
A field costs nothing to leave in, and every reader pays to skip it.
So the catalogue was cut to what something reads, and a process names which of it applies.
That is what lets the catalogue grow without any token growing with it.

## costs

A field is refused until a reader for it exists.
So a schema change and the code reading it land together, rather than one ahead of the other.
Work that wants somewhere to put a value has nowhere to put it until then, and says so on a token instead.

## revisit when

- a field is read by a person rather than by code, and the schema has no way to say so
- a process needs a field the catalogue does not carry and cannot wait for its reader
