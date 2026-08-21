---
form: shared-test-helpers
by: agent
signed_off: 2026-08-21T13:20:49.210Z
authors: agent
files:
---

# Evidence form / shared-test-helpers

## current_situation

Shared test fixture setup now has one Git strategy with an explicit commit mode, plus named synchronous and asynchronous refusal strategies.

## built

deliverable/tests/helpers.ts now exports gitInit(root, commit), refusal, and refusalAsync. claimops, drawnsub, drift, reopen, fallback-outcome, iterations, gitlane, bases, baseui, emergency, expr, floor, power, choice-refused, and pull-seam migrated their matching local helpers. readDocs was removed because it had no callers.

## follow_up

Validate the durable helper regression at verification. Continue with refusal-only server sharing, fallback-outcome YAML repair, and testlint guards.

## anything_else

