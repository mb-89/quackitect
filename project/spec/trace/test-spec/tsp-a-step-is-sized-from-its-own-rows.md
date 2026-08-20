---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: tsp-a-step-is-sized-from-its-own-rows
type: "[[test-spec]]"
statement: Every row the sizing block is asked about yields a difficulty, a unit yields one no weaker than its hardest step, and a rung with no entry publishes nothing and says which rung was unmatched.
method: test
verifies:
  - req-every-matrix-row-declares-its-complexity
  - req-a-milestone-takes-the-maximum-complexity-over-its-rows
  - req-an-unmatched-rung-names-itself-and-publishes-no-driver
files:
  - tests/sizing-block.test.ts
---

## Scope

THE THREE ROWS THAT DECIDE WHAT COMES OUT OF THE BLOCK for a given input. They
share one verification concern — what the block answers when asked — and they
fail together or not at all: a missing row value, a unit reduced too weakly, and
a rung nothing maps are three ways for the same answer to be wrong.

OUT OF SCOPE: what the published value is USED for. That is outside the box by
`req-the-machine-names-a-driver-and-starts-nothing`, and the party that acts on
it is a neighbour.

ALSO OUT OF SCOPE: whether the declared difficulties are CORRECT. Two independent
readers agreed on five of six sampled cells (`exp-two-hands-rating-the-same-six-cells`),
which is evidence about the rating act and not about any particular row. No test
can assert a judgement is right.

## Approach

LEVEL: unit, against the loader and the sizing block directly. The matrix is a
file the repository owns, so the inputs are real rather than mocked, and a
fixture matrix carries the corner cases the live one does not yet hold.

DEPTH: two of the three requirements are graded crippling and one is the row a
whole milestone's design rests on. The unmatched case gets the most cases,
because it is the one that fails silently.

WHAT MAKES A ROW PASS is a returned value, never an absence. That is
`raid-dec-the-no-match-is-a-returned-value-not-a-silence`, taken from OASIS
XACML 3.0's separation of NotApplicable from Indeterminate: no policy matched is
a different result from the evaluation failing, and both are results.

## Steps

EVERY CASE IN THE REFERENCED FILE IS ONE STEP. What is owed:

- EVERY APPLICABLE ROW YIELDS A DIFFICULTY. Load a matrix in which every row
  applies in at least one change-size column, and assert a difficulty comes back
  for every row-and-column pair that applies.
- A ROW MISSING ONE IS A LOUD REFUSAL. Load a matrix with a row that applies in a
  column and declares nothing there, and assert the load REFUSES naming the row
  and the column. A default, a fallback or a silent skip fails this step.
- A ROW THAT DOES NOT APPLY IN A COLUMN IS NOT A HOLE. Assert no refusal for a
  column the row is not in. The requirement says "in which that row applies" and
  a check that ignores the clause would make the live matrix unloadable.
- A UNIT IS NO WEAKER THAN ITS HARDEST STEP. Ask for a unit holding steps of
  mixed difficulty and assert the answer is at least the maximum.
- THE SPREAD IS VISIBLE. Assert the per-step values ride alongside the unit's
  answer, so a reader can see how far each step sits below it. A unit answer
  with no spread satisfies the first half of the requirement and not the second.
- AN UNMATCHED RUNG PUBLISHES NO DRIVER. Ask for a rung the list does not carry
  and assert the result names that rung and carries no driver.
- AND IT NEVER FALLS BACK. Assert the unmatched result is not the session's
  current hand, not the last answer, and not the strongest entry. A silent
  fallback is indistinguishable from a working lookup, which is the whole reason
  the requirement exists.
