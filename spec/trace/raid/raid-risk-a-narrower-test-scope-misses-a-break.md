---
minted_in: i51
id: raid-risk-a-narrower-test-scope-misses-a-break
type: "[[raid]]"
kind: risk
statement: "Teaching the engine to run fewer tests for a change lets a real break through, because the mapping from a changed file to the tests that answer for it is a guess."
owner: the driving agent
trigger: the first verification battery that fails on something a scoped run for the same diff had passed
status: open
impact: "A scoped run that passes is read as evidence the change is sound. Where the mapping missed the test that would have caught it, the walk carries a false green as far as verification."
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - note-d393a93e0112
  - i51
---

## Why it stands

The engine already decides what to run. It falls back to the whole battery
whenever a changed file has no test that answers for it.

Today that fallback fires on most document changes. Ten batteries ran in one
session on it, most fired by edits to markdown alone.

## What the fix costs

Narrowing the fallback means the engine says "these tests answer for this
diff", and a mapping that is wrong lets a break through.

## Why the ruling went the other way

The goal system ruled conflict three for the narrower scope.

The current fallback is not the safe option it appears to be. Running every
test when nothing answers for the diff does not answer for the diff either. It
buys time, not evidence.

## What holds the line

The full battery still fires at verification, and that is unchanged. A scoped
run is a question asked mid-walk, never the release evidence.

## What would retire it

A recorded comparison across several diffs: what the scoped run selected, and
what the verification battery found that the scoped run did not.
