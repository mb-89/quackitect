---
kind: method
statement: EARS - author every requirement statement in one of five shapes, with shall.
source: ref-iso-29148
---

## Situation
A requirement statement must be checkable. Free prose hides conditions and weasel words.

## Effect

Five shapes force the trigger, the system and the response apart:

- ubiquitous
- event-driven
- state-driven
- unwanted behaviour
- optional feature

A lint can check every statement mechanically.

## Procedure
Pick the shape that fits the behaviour. Write `When <trigger>, the <system> shall <response>.` or its siblings. No should, no may, no quickly.
