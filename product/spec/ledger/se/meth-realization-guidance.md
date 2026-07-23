---
id: se.meth-realization-guidance
kind: method
statement: "The realization-kind guidance registry: guidance declares applies_to, chunks declare realization, the engine joins them at serve time."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
---

## Situation
Build chunks differ by discipline - a Python chunk, a CAD chunk, a chapter chunk each need different working guidance and different checks. Nobody lists guidance per chunk; the join is the engine's.

## Procedure
- A guidance note declares `applies_to: realization/<kind>` (or realization/* for all). Writing that note is the whole act of deploying it.
- A seeded chunk declares `realization: <kind>` - one word, set by the planner.
- The work packet serves matching guidance to whoever builds the chunk - the driving agent and delegated sub-agents alike.
- Discipline checks ride the same match: unit and contract tests for code, interference check and tolerance stack for CAD, the stranger's read for documents.
- Modules may contribute guidance slices; project-local beats module, specific beats generic.
- An empty registry is legal: chunks serve fine without; the first note reaches every future chunk of its kind.
