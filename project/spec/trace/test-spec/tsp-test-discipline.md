---
minted_in: i1
id: tsp-test-discipline
type: "[[test-spec]]"
statement: A test run answers a named question with a structured verdict, a first green needs its red, and a red is never carried, verified by test over the test lane.
method: "test"
verifies:
  - "req-scoped-run-records-its-timings"
  - "req-test-scope-discipline"
  - "req-test-result-is-structured"
  - "req-first-green-needs-a-red"
  - "req-red-is-never-carried"
files:
  - "tests/discipline.test.ts"
  - "tests/verdictlog.test.ts"
  - "tests/testlint.test.ts"
---

## Scope

The test lane's own laws: scoped runs against their question, the
unchanged-tree gate, structured verdicts that survive truncating pipes,
and the test-first pair of red-before-green and no-carried-red.

## Approach

Component level, fault-based around the gates: an unchanged tree, a
wrong scope, a red battery. Two claims are DEFINED here ahead of their
cases and land as named cases in discipline.test.ts with the build that
closes them: the first-green-needs-a-red flag, and the hold-until-
resolution on a carried red.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: an unchanged tree refuses a re-run; any
tracked change opens the gate again; parseTap keeps the counts and only
the failures' detail; a RED battery re-runs freely — a standing failure
is never fenced off; a handed-off scoped run logs its own verdict
without being fetched.
