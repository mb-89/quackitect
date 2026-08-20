---
minted_in: i6-conformance-goes-mechanical-checks-bind-
id: req-a-red-is-an-assertion-not-a-crash
type: "[[requirement]]"
statement: When the engine observes a new check failing before its build, it shall require at least one failure to be an assertion failure, and shall name every case that failed by crashing instead.
kind: functional
verify_method: test
breaks_if_removed: A broken check file reads as a proven red. The state whose whole job is watching a new check fail passes on an instrument failure, and the build that follows is graded against a check that never ran its expectation.
breaks_how_badly: crippling
refines:
  - uc-answer-a-question-with-tests
source_refs:
  - spec/iterations/i6-conformance-goes-mechanical-checks-bind-/evidence/write-budget.md
  - deliverable/engine/bin/red-observed.ts
  - req-test-result-is-structured
priority: must
---

## Detail

TWO REDS LOOK IDENTICAL IN THE COUNTS, and only one of them is news.

- AN ASSERTION FAILED. The check ran, reached its expectation, and the
  expectation was unmet. That is the design not yet realized, which is
  exactly what the state is watching for.
- THE CASE CRASHED. The check threw before it reached any expectation.
  A missing import, a typo in a helper, a file that does not parse.

The counts cannot tell them apart. `# fail 4` is the same four either
way.

## Why this matters here

THE STATE PASSES ON AN INSTRUMENT FAILURE TODAY. Its own header says a
check green from birth proves nothing. A check that crashes from birth
proves just as little, and it currently reads as the red the state was
asking for.

## What the TAP already carries

Node's TAP reporter writes a diagnostic block under each `not ok`, and
an assertion failure carries `code: 'ERR_ASSERTION'` in it. Nothing new
has to be measured. The distinction is already on the wire and was being
thrown away.

MEASURED 2026-08-16, in this iteration's own probe: nine write-guard
cases ran, four failed, and every one carried `code: 'ERR_ASSERTION'`.
None crashed. The distinction was observable by hand and by nothing else.

## What the check demands

AT LEAST ONE FAILURE IS AN ASSERTION. That is the whole demand.

A CRASH ALONGSIDE AN ASSERTION IS REPORTED, NOT REFUSED. Some checks
legitimately throw before the build exists. The refusal is for a red
made of crashes ALONE, because then nothing was observed failing an
expectation.

## Behaviour

NO MODEL WANTED. One field read out of a block the parser already
collects, and one count compared against zero.
