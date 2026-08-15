---
minted_in: i1
id: uc-quality-functional-suitability
type: "[[use-case]]"
statement: Get what the method actually promises, not a subset of it
actor: stk-engineer-driving-agents
kind: quality-area
trigger: The walk reaches a step the method says exists.
precondition: A record is open and the column was compiled from the rigor matrix.
guarantee: Every step the matrix demanded is present and does what it says, and a step that cannot be served says so.
refines:
  - sty-what-a-quality-is
priority: should
---

## What this characteristic covers

FUNCTIONAL SUITABILITY, from ISO/IEC 25010:2023. The degree to which a system
provides functions that meet stated and implied needs when used under
specified conditions.

Its sub-characteristics, so nobody has to open the standard to use this:

- FUNCTIONAL COMPLETENESS. The set of functions covers all the specified
  tasks and user objectives.
- FUNCTIONAL CORRECTNESS. It provides correct results with the needed degree
  of precision.
- FUNCTIONAL APPROPRIATENESS. The functions facilitate the accomplishment of
  the specified tasks and objectives.

WHY A CHARACTERISTIC AND NOT THE WHOLE REGISTER. Every functional requirement
is about what the system does. This characteristic is about the SET being
whole and right — the demands nobody would write as a feature, like "the
compiled column carries every row the matrix demanded".

## Main scenario

1. A record is opened and its column is compiled from the live rigor matrix.
2. Every row the matrix demands for that change size becomes a state in the column.
3. The walk reaches each one, and each serves the guidance and the form the row named.
4. A step whose condition cannot be met refuses with the condition named, rather than being skipped.
5. The record closes only when every state it compiled has been earned.

## Extensions

- 2a. The matrix moved after the column was compiled: the pinned ledger and the live matrix disagree, and the disagreement is reported rather than silently resolved.
- 3a. A row names a form template that does not exist: the compile fails loudly, because a state that asks for nothing checks nothing.
- 4a. A step is genuinely not applicable: it is struck in the matrix with a reason, never skipped in the walk.
