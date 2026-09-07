---
kind: [[rationale]]
title: measuring is separate from refusing
explains:
  - src/engine/store.go
---

## decided

overCaps answers every bounded section that runs past its bound, in the order the schema declares them. It does not word the refusal. The save wraps its answer in one, and the write door uses the same measurement for a question of its own.

## why

Two doors want the measurement and only one of them wants the save's wording. The write door has to compare what a section would become against what it already holds. A function doing both jobs would hand that door a sentence it then has to unpick.

The bound is the section's maxWords, and the count is overWords, which the lint and the language server already run. So a chapter the editor marks is a chapter the save refuses. A writer meets one answer at the editor and the same one at the door.

## costs

The refusal's wording lives away from the measurement, so a change to one can leave the other reading oddly. Somebody chasing a refusal has two functions to open rather than one.

## revisit when

- a third caller wants different wording, so the split stops paying for itself
- the editor and the save disagree about a bound, which the shared counter exists to prevent
- the refusal grows logic that needs the measurement's internals
