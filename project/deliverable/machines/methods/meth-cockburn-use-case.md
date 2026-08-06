---
kind: method
statement: "Cockburn-shape use cases: one actor one goal, 3-9 numbered steps, extensions branching from step numbers - each generalizes at least one story, and requirements derive from the steps."
---

## Situation

M2: use cases GENERALIZE the stories. Where a story is one concrete pass, the
use case is every pass.

## A STORY IS ONE PASS, A USE CASE IS EVERY PASS

This is the whole distinction, and getting it backwards produces two piles of
the same artifact.

A STORY is this person, this Tuesday, these clicks, in the order they happened.
It is an example. Its job is to be concrete enough that somebody would notice
if it were wrong.

A USE CASE is the same goal told once, with the branches that can happen along
the way. It has no Tuesday in it. Its job is to be complete enough that the
requirements can be derived from it.

THE TEST FOR EACH. A story with no order is not a story. A use case with a
particular person's afternoon in it is not a use case.

## THE TWO ARE WIRED, BOTH WAYS

EVERY USE CASE REFINES AT LEAST ONE STORY. The story is what proves the general
form is real. A use case with no story under it is a capability nobody has
walked, and nothing says the steps as written would work.

EVERY STORY SITS INSIDE A USE CASE. A story that generalizes to nothing is one
of two things: a use case nobody wrote down, or a pass the product does not
actually support. Both are worth finding.

THE ENGINE CHECKS BOTH DIRECTIONS. The evidence field declares `covers: story`,
so the state refuses to close while either side has an orphan. Neither is a
judgment call and neither waits for a reviewer.

## REVERSE-ENGINEERING FINDS MISSING STORIES

Walking a system that already exists turns up goals nobody told a story about.
That is a result, not a failure.

When it happens, WRITE THE STORY FIRST, then the use case over it. The order
matters: the example is what makes the general form checkable, and a use case
written without one is a guess about how the product behaves.

## Form

- Header: actor; trigger; precondition; guarantee. What starts it, what must
  hold, what is true when it succeeds.
- Main scenario: THREE TO NINE numbered steps. Past nine it is two use cases.
- Extensions: each branches from a numbered step and says so — 3a, 3b, 5a.
  Name the condition, then what happens instead.
- Verb plus object names. NO user-interface mechanics: the use case survives a
  rewrite of every screen it touches.

## Procedure

- One actor, one goal. A second goal is a second use case.
- Every story maps into a scenario path. Where a new story fits an existing use
  case's extension, extend rather than add.
- Every extension is a candidate example, and M6 may script it.
- M3 derives requirements from the steps and extensions. A step no requirement
  covers is a hole, visible in the coverage matrix rather than in a review.

## WHY THE CHECKS ARE MECHANICAL

A shape declared in a template and never checked will not be filled. That is
why the coverage check runs both ways here, and why the steps live in sections
the conformance check can see rather than in prose it cannot.

## Sources

Cockburn, Writing Effective Use Cases; SyA RE deck (ref-sya-re); v1's own
`method/templates/items/usecase.md` at ref main.
