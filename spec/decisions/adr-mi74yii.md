---
id: adr-mi74yii
type: adr
decided_in: i0025_clean_state
adjudicated_by: user
statement: Retired by the owner's i25 ruling (2026-07-17): test-model-groom and test-model-tray die with their vetoed requirements. req-model-groom and req-model-tray were scrapped final in i16 (adr-fu55aja, adr-6cfyu3a); the tests' selftests left the engine in a later compaction, and the nodes rode stale cached verdicts until the i25 cache flush exposed them. A test of a vetoed requirement retires with it.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm
---
## Rationale (not load-bearing)
A test exists to verify a requirement. When the requirement is vetoed final, the test verifies nothing true. Keeping it forces the battery to fail forever on a selftest that rightly left the engine. The retro carries the wider lead: a lint family for ledger rot (missing selftests, tests of vetoed requirements, unrooted decisions).
