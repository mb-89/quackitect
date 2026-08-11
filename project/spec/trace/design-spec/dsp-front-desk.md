---
id: dsp-front-desk
type: "[[design-spec]]"
statement: the place a walk waits and a person routes, carried by the drawn main machine and its desk state
realizes:
  - "el-front-desk"
files:
  - "project/deliverable/machines/main.canvas"
---

## Responsibility

The desk is drawn method, not engine code: the main canvas holds it,
the compiler runs it, and the session's routing serves its options. It
greets with what is walkable, takes plain words, and opens records only
on the person's word.

## Rationale

An element whose realization is a drawing still owes its spec — the
trace to code for the desk runs through the walk machine and the
method compilation, both specified in their own notes.
