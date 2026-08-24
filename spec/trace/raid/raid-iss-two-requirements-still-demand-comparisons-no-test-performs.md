---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: raid-iss-two-requirements-still-demand-comparisons-no-test-performs
type: "[[raid]]"
kind: issue
statement: "Three test specs were amended off timing comparisons and onto countable oracles, and the two requirements those specs verify still carry the timing language, so the spec layer and the requirement layer now disagree."
owner: the driving agent
trigger: it has happened, and a cold reviewer found it at the implementation gate
status: closed
impact: "The specs record why they moved and the requirements do not, so a reader following the trace downward meets a demand that nothing under it checks. The coverage check cannot see it, because a spec resolving to a requirement is all it asks."
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - req-aiming-returns-before-the-walking-starts
  - req-a-hop-of-the-walk-carries-its-own-time-budget
  - tsp-pointing-the-walk-costs-the-same-whatever-the-distance
  - tsp-every-hop-records-how-long-it-took
---

## What moved and what did not

THE SPECS MOVED. Two were amended off medians over ten runs and onto counts,
because both compare millisecond-scale operations that differ more between runs
than the defect would move them. One was amended off "greater than zero", which
a memoized expand cannot satisfy.

THE REQUIREMENTS DID NOT. One still demands that a target twenty hops away
answers no slower than one hop away, within the noise of ten runs each. The
other still says the duration must be readable from the trail, where the spec
now reads it from the answer.

## Why this is worse than an untested requirement

AN UNCOVERED ROW IS VISIBLY UNCOVERED. The coverage check says so and somebody
fixes it.

A ROW WHOSE SPEC MOVED AWAY FROM IT STILL RESOLVES. The spec names the
requirement, the requirement is covered, and the trace closes. Nothing anywhere
asks whether the spec still checks what the requirement asked for.

## The amendments themselves were sound

THIS IS NOT AN ARGUMENT FOR PUTTING THE MEDIANS BACK. A test that fails on a
busy machine teaches its reader to rerun rather than to look, and the
measurement behind each amendment is recorded in the spec that carries it.

WHAT WAS SKIPPED was carrying the same reasoning up one layer.

## What closed it

BOTH REQUIREMENTS WERE AMENDED, at author-tests, with the same measurement the
specs recorded.

- The aiming row now measures that nothing was swept and no arrival reported,
  plus the search's own bound. That is what the row was always about, and it
  needs no clock.
- The hop-budget row now says the duration is read from the answer, and the
  owner's ruling that the budget binds the mechanical flip rather than the work
  is written into it.

A THIRD ROW WAS REWORKED IN THE SAME PASS, on the owner's instruction, because
its measure was not merely adrift from its spec but impossible:
[[raid-iss-the-failed-route-test-asserts-the-converse-of-its-requirement]].

## The general shape, which is the part worth keeping

AMENDING A SPEC IS CHEAP AND AMENDING A REQUIREMENT IS NOT, so the pressure is
always to move the lower layer. That asymmetry is what produced this, and it
will produce it again wherever a measure turns out to be unmeasurable.
