---
id: se.meth-ears
kind: method
statement: EARS - author every requirement statement in one of five shapes, with shall.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_applies_chapters:
  - design-input
v1_applies_type:
  - default
v1_applies_rigor:
  - lean
  - systematic
v1_source: ref-iso-29148
v1_aliases: []
---

## Situation
A requirement statement must be checkable. Free prose hides conditions and weasel words.
## Effect
Five shapes (ubiquitous, event-driven, state-driven, unwanted behaviour, optional feature) force the trigger, the system, and the response apart. The lint checks every statement mechanically.
## Procedure
Pick the shape that fits the behaviour. Write `When <trigger>, the <system> shall <response>.` or its siblings. No should, no may, no quickly.
## Tools
`quack lint` runs the EARS check over every requirement statement.
