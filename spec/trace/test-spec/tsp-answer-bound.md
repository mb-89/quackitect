---
minted_in: i27
id: tsp-answer-bound
type: "[[test-spec]]"
statement: No lane answer exceeds a declared size, and an answer that would carries a reference to the rest instead.
method: test
verifies:
  - req-the-answer-never-exceeds-its-bound
files:
  - tests/answer-bound.test.ts
---

## Scope

Every answer the lane returns, on every host. The bound itself and the
reference that stands in for what was cut.

WHAT IS DELIBERATELY OUT. Making the sources smaller. The record's scope asks
for a source split into sub-indexed chunks ALONGSIDE the bound, and that is a
different concern with no element carrying it yet.

## Approach

DESIGN METHOD: boundary value analysis, because the whole requirement is one
boundary. Three cases — under, at, and over the declared size.

LEVEL: component for the bound, integration for the reference that serves the
rest.

DEPTH: high, and the reason is a use event rather than a grade. Every pull
this session returned between 280 and 350 KB and could not be read. Two fills
were misdirected as a direct result, and the record's own scope names three
overflows in its smallest milestone.

## Steps

Every case in `tests/answer-bound.test.ts` is one step.

ALL OF THEM ARE RED TODAY, and that is the honest state. The engine declares
no bound at all, so there is nothing to be under or over.

- The engine declares a bound for an answer.
- An answer within the bound is returned whole.
- An answer that would exceed the bound is returned within it, carrying a
  reference that serves the rest.

## Why this spec is small and its requirement is not

The bound is one number and one branch. What makes the requirement hard is
everything upstream of it: a form that assembles a whole scenario deck before
anyone asks how big it is.

This spec checks the floor. The floor is what guarantees no answer can ever
overflow whatever the sources look like, which is the owner's own framing of
the two halves.
