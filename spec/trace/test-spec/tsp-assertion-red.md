---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: tsp-assertion-red
type: "[[test-spec]]"
statement: The TAP parser reads a failure's kind out of its diagnostic block, telling an assertion failure from a crash, and keeps the two apart across a mixed run and a subtest roll-up.
method: test
verifies:
  - req-a-red-is-an-assertion-not-a-crash
files:
  - tests/assertion-red.test.ts
---

## Scope

The parser, not the state script. The kind is one field read out of a
block the parser already collects, and that is where the whole demand
lives.

## Approach

UNIT LEVEL, AGAINST REAL TAP. The cases hold fragments in the shape
Node's own reporter writes, because the demand is entirely about reading
that format correctly.

FIXTURES RATHER THAN A LIVE RUN. Producing a genuine crash-only red on
demand means writing a check file that is broken on purpose, and a
broken file in the tests folder is a check the battery then has to
tolerate forever.

## Steps

Every case in the referenced file is one step; the case name states its
claim. The load-bearing steps:

- AN ASSERTION FAILURE READS AS `assertion`, on `code: 'ERR_ASSERTION'`
  in its diagnostic block.
- A CRASH READS AS `crash`. It carries a different code and a different
  error name, and it never reached an expectation.
- A MIXED RUN KEEPS BOTH APART, in order. The kind is per failure, never
  per run.
- A SUBTEST ROLL-UP DOES NOT BECOME A CRASH. The parent carries
  `ERR_TEST_FAILURE` and is dropped where a leaf survived it, so the
  kind must come off the leaf.
- A GREEN RUN HAS NOTHING TO CLASSIFY.

## What is deliberately not here

THE STATE SCRIPT'S OWN VERDICT. `red-observed.ts` composes the counts
into a refusal, and its behaviour is a demonstration step on the
observe-red row rather than a case here.

## The measurement behind the row

2026-08-16, this iteration's own write-budget probe: nine write-guard
cases ran, four failed, and every one carried `code: 'ERR_ASSERTION'`.
None crashed. The distinction was observable by hand and by nothing
else.
