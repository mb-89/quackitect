---
steps:
  - id: sty-answer-what-does-this-touch
    statement: An agent asks the query verb what a decision touches, gets filtered rows back, then gets refused by name when it asks for a field the view does not carry.
    depends_on: []
    realization: demonstration
  - id: sty-dispose-a-candidate-coupling
    statement: An agent describes a real change, asks the BM25 sibling for candidate couplings, and gets one disposition row per candidate with nothing left silently pending.
    depends_on: []
    realization: demonstration
---

# The demonstrations, two must stories

## Why two, and why now

WRITE-STORIES ADDED THREE STORIES THIS ITERATION and only two came out graded
must: sty-answer-what-does-this-touch and sty-dispose-a-candidate-coupling
(the third, sty-trust-a-repeatable-answer, is not must). Both refine value
props graded must in their own right (vp-the-ledger, vp-rigor-without-toil),
so a demonstration is owed rather than optional.

BOTH WERE BLOCKED UNTIL THIS ITERATION SHIPPED THE VERB. i33 wrote their
test-specs (tsp-a-structured-query-answers-what-a-decision-touches,
tsp-candidate-couplings-are-disposed-one-by-one) against evaluators that
existed with no lane door reaching them. gate-implementation, signed this
iteration, wires se_query and se_couplings into the tool list. Both
demonstrations can run for real for the first time.

## No iteration had authored this drawing before

i15 and i27 both carried the placeholder this file replaces, and i33 records
that plainly: no iteration has authored this drawing before. i33 authored
its own three-step drawing for its own must stories; this is i15 own turn,
scoped to the two must stories i15 itself unblocked.

## NO STEP DEPENDS ON ANOTHER

The query verb and the BM25 sibling are independent capabilities, each with
its own test-spec and its own procedure. Either can be performed alone.
