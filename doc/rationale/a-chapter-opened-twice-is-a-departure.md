---
kind: [[rationale]]
title: a chapter opened twice is a departure
explains:
  - src/engine/schema.go
---

## decided

A note that opens the same chapter twice departs from its schema, and so does a discussion that argues one rule in two chapters.
The second is reported at its line and left out of what the rest of the check reads.
Neither is silently replaced.

## why

Chapters were collected into a map by header.
The map kept the last chapter under the name and the first was buried with nothing saying so.
Measured on wk-963dbf6898: two approach sections in different words, and no reader could say which one the change was written against.

The explains walk had the same hole.
Two chapters numbered the same both found their star and both passed.
So a rule could be argued twice and a reader had no way to know which chapter was the one.

The one answer covered both.
The first chapter under a name is the chapter, and a second one is a departure named at its own line.
A replacement would have hidden the fault, and a merge would have written a note nobody wrote.
The token store refuses the same shape on a save, so a note cannot reach the lint that way.

## costs

A writer who meant to append to a chapter has to fold the two together before the note is accepted.
The rule stands in two places, the lint and the store, and the two are kept in step by hand.

## revisit when

- chapters carry an order of their own, so a second one under a name reads as a continuation rather than a replacement
- the store and the lint read a note through one reader, so the rule can be written once
