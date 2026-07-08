---
statement: EARS - author every requirement statement in one of five shapes, with shall.
applies_chapters: [design-input]
applies_type: [default]
applies_rigor: [lean, systematic]
source: ref-iso-29148
aliases: []
---
## Situation
A requirement statement must be checkable. Free prose hides conditions and weasel words.
## Effect
Five shapes (ubiquitous, event-driven, state-driven, unwanted behaviour, optional feature) force the trigger, the system, and the response apart. The lint checks every statement mechanically.
## Procedure
Pick the shape that fits the behaviour. Write `When <trigger>, the <system> shall <response>.` or its siblings. No should, no may, no quickly.
## Tools
`quack lint` runs the EARS check over every requirement statement.