---
minted_in: i36
id: tsp-oversized-results-remain-recoverable-through-the-lane
type: "[[test-spec]]"
statement: A lane result larger than the smallest measured inline host limit comes back bounded, and a lane-owned cursor rebuilds the complete result byte for byte.
method: "test"
verifies:
  - "req-oversized-results-remain-recoverable-through-the-lane"
files:
  - tests/answer-bound.test.ts
---

## Scope

Every lane answer that would not fit inline on the tightest host measured.
Two claims, and the second is the one that makes the first safe.

- The first response is bounded, at most 6,000 characters serialized.
- Paging the cursor reconstructs the whole result, losing nothing.

WHAT IS DELIBERATELY OUT. Making the sources smaller. Splitting a large
source into chunks is a separate concern; this spec checks that a large result
survives whatever the source looks like.

## Approach

DESIGN METHOD: boundary value analysis on the bound, because the whole claim
is one boundary. Under it, at it, and over it.

A second method rides beside it: round-trip testing for the reconstruction.
The oracle is exact equality with the original bytes, which is stronger than
any spot check and cheaper to write.

LEVEL: component for the bound. Integration for the cursor, which has to reach
the answer store the paging reader uses.

DEPTH: high, and the reason is a use event rather than a grade. This session
alone hit the bound on `se_survey`, on `se_pull`, on `se_aim`, on `se_run` and
on `se_file_read`, and every one of them was recovered by the cursor.

## Steps

Every case in `tests/answer-bound.test.ts` is one step. Ten cases stand there
today.

MOST OF THIS REQUIREMENT IS ALREADY GREEN, and saying so is the honest
report.

- The engine declares a bound for an answer.
- An answer within the bound is returned whole.
- An oversized answer never exceeds the bound.
- An oversized answer carries its first page inline, so the caller always sees
  content.
- The cursor names a verb that pages, so following it cannot recurse.
- The whole answer is on disk where the paged reader can reach it.
- A refusal is bounded, because an unreadable refusal hides its own remedy.
- An error is bounded, and it is the worst one to lose because it carries no
  remedy.

TWO ARE RED TODAY. Both are the parts this requirement adds beyond the
standing bound.

- The declared bound is tied to the SMALLEST MEASURED inline host limit,
  rather than to a number chosen independently of any host.
- Paging the cursor to exhaustion reconstructs the original result byte for
  byte, and the reconstructed text parses as the original result.

## Why byte equality and not a spot check

A cursor that returns most of a result is worse than one that returns none,
because the caller cannot tell. The failure shows up later, as a parse error
or a missing row, far from the call that lost it.

Byte equality is the only oracle that cannot be partially satisfied.
