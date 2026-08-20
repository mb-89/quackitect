---
minted_in: i36
id: raid-boot-test-metadata-coupling
type: "[[raid]]"
kind: issue
statement: Boot can be blocked by the latest test-run record lacking metadata that the boot checker requires.
owner: the driving agent
trigger: every boot preflight and every change to test-run logging
status: open
breaks_how_badly: corrosive
how_likely: expected
impact: A valid boot can stall until an agent creates a fresh test record. Recovery then depends on knowing a hidden metadata coupling.
source_refs:
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/onboard-retro.md
  - spec/iterations/i36-the-harness-is-not-claude-measure-what-e/evidence/define-actual.md
---

## Finding

The failure happened during the i36 start.

`record-inspect` refused because the newest test run did not carry `question` and `scope`.

A fresh `se_test` record cleared boot.

## Constraint

The fix must keep the check.

The recovery should be mechanical.
