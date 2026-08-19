---
minted_in: i9
id: raid-iss-this-records-cited-line-numbers-moved-under-it
type: "[[raid]]"
kind: issue
statement: "Three of the four code anchors this record cites have moved, because two later iterations restructured the file after this record was seeded."
owner: the driving agent
status: open
impact: "A builder following the record lands on unrelated code, and the sizing argument rests on a claim about how small the change is that nobody can now check from the citation."
breaks_how_badly: abrasive
how_likely: certain
source_refs:
  - "the record was seeded 2026-08-12; the file it cites was restructured by two iterations that shipped after"
---

## What the record cites, and what stands there now

THE FILE IS `engine/paths.ts`, and it is 342 lines today.

- LINE 18 was said to hide five directory names. It is a documentation comment
  about declared-root shapes.
- LINE 30 was said to resolve the machine-state folder. It is a comment about
  identity files.
- LINES 150 TO 152 were said to pin the folder to the project root. They are
  inside a path-escape rejection.

ONE CITATION SURVIVES. The predecessor's file at a committed ref is unaffected,
because a ref does not move.

## The claim that rests on them

THE RECORD SAYS THE RESOLVER IS THREE LINES. That figure is what makes the move
sound cheap, and it cannot be confirmed from the citation any more.

WHAT A SEARCH SHOWS INSTEAD: the folder path is threaded as an argument through
at least four other modules, each building its own file path from it. Whether
the move is still three lines is now an open question rather than a stated
fact.

## Why it happened

A SEEDED RECORD IS A SNAPSHOT AND THE CODE IS NOT. Seven days passed between
the seed and the walk, and two iterations shipped in between.

## What would stop it recurring

A CITATION TO A LINE NUMBER GOES STALE SILENTLY. A citation to a symbol name
does not. The record could name what it points at rather than where it sat,
and a check could then confirm the symbol still exists.

THAT IS A GENERAL FIX AND IT IS NOT THIS ITERATION'S. It is recorded here so
the pattern is visible rather than met again.
