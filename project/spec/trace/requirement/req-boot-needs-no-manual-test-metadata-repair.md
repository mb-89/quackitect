---
minted_in: i36
id: req-boot-needs-no-manual-test-metadata-repair
type: "[[requirement]]"
statement: When boot checks the latest test evidence, the system shall reach the front desk without requiring an agent to create a replacement test record by hand.
kind: quality
characteristic: reliability
verify_method: test
breaks_if_removed: A valid session can stall before work because an older test record lacks newer metadata.
breaks_how_badly: crippling
measure: One hundred boot runs containing stale or malformed historical test records require zero manual se_test calls and preserve every boot check.
refines:
  - uc-quality-reliability
source_refs:
  - raid-boot-test-metadata-coupling
priority: must
weighs_with:
  - req-a-resolution-is-proven-by-read-back ! — one is a test-authoring discipline about proving tree resolution, the other is boot tolerating a stale test-record shape; different artifacts
  - req-a-wrong-act-never-passes-silently ! — one is a runtime guarantee against silent failure across all calls, the other is boot's own handling of one record format; different scopes
  - req-interrupted-call-names-the-stopping-layer ! — one is diagnosing an already-interrupted call, the other is tolerating an old test-record shape at boot; different triggers
  - req-stop-hook-yields-only-at-a-machine-stop ! — one prevents a premature session end, the other repairs boot's own record reading; different mechanisms
weighs_against:
  - none
---

## Scenario

- Source: an agent starting a session.
- Stimulus: boot inspects a latest test record without question or scope metadata.
- Artifact: the boot record inspector.
- Environment: a repository carrying historical test records from older formats.
- Response: boot handles the stale record mechanically and keeps the check active.
- Response measure: zero manual test runs across 100 affected boots; every boot check still executes.
