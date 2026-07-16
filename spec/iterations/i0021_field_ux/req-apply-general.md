---
id: req-apply-general
type: requirement
statement: The apply lane shall generalize beyond byte-exact replacement: create, write, replace, one audit trail, dry-run-first and all-or-nothing throughout. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. The apply manifest shall support create, whole-file write, and byte-exact replace operations.
2. When an apply manifest executes, the engine shall record the touched files and the outcome in the call log.
3. The apply lane shall stay dry-run-first and all-or-nothing across every operation kind.

## Rationale (not load-bearing)
Generalizing i18's req-apply-default-lane: today apply handles only old->new replacements, so
creation and whole-file writes fall back to harness tools outside the engine's audit. How FAR
mediation goes (default lane vs universal) is q-io-lane-scope - the owner rules at M3/M4; this
requirement only makes the lane capable of it.
