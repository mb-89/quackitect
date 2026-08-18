---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-coverage-computes-both-sides
type: "[[test-spec]]"
statement: A coverage check reads both its sets from the corpus, so its verdict cannot be moved by what the agent types, and the field it leaves behind asks only what the corpus cannot answer.
method: test
verifies:
  - req-a-coverage-check-computes-both-sides
files:
  - tests/coverage-both-sides.test.ts
---

## Scope

Every field declaring `covers: <type>`. Today it reads the COVERED side
from disk and the COVERING side from the agent's message.

## Approach

COMPONENT LEVEL, AND THE HARD PART IS ASSERTING AN ABSENCE. The defect
is that a listing can satisfy the check, so the cases must show the
verdict does NOT move when the listing changes.

TWO DIRECTIONS, BOTH NEEDED.

- A CORRECT CORPUS PASSES WITHOUT THE LISTING. An edge in frontmatter is
  enough; nothing has to be typed for it to count.
- A GENUINE HOLE STILL REFUSES. Computing both sides must not soften the
  check into a report, and the orphan is still named by id.

THE THIRD CASE GUARDS THE OTHER FAILURE MODE. Deleting the field
entirely would also pass the first two cases and would lose the one thing
only the author knows — which nodes THIS delta touched.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- NO COVERAGE FIELD ASKS FOR THE ENUMERABLE SET. A field description
  still saying "every X as a reference, one per line" is the defect in
  its own words.
- A CORRECT CORPUS ANSWERS CLEAN WITH NOTHING LISTED. A story refining a
  prop, written to disk and never typed into a form, counts.
- THE FIELD STILL ASKS FOR THE DELTA'S OWN SET, which the corpus cannot
  compute and the author can.
- A REAL HOLE IS STILL REFUSED AND STILL NAMED BY ID. A proposition with
  no story anywhere is a hole whether or not anybody listed it.

## Why this row is graded fatal

MEASURED THREE TIMES ON THIS ITERATION'S OWN WALK, at write-stories,
generalize-use-cases and write-requirements. The fixes cost five, then
twenty-two, then thirty-three typed names, and nothing was examined on
any of the three.

THE COST OF PASSING GROWS WITH THE CORPUS AND THE VALUE DOES NOT. That
is why it is not a check that needs tuning.
