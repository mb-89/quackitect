---
id: se.adr-mi74yii
kind: anti_decision
statement: Retired by the owner's i25 ruling. test-model-groom and test-model-tray die with their vetoed requirements. req-model-groom and req-model-tray were scrapped final in i16. See adr-fu55aja and adr-6cfyu3a. Their selftests left the engine in a later compaction. Stale cached verdicts hid the nodes until the i25 cache flush exposed them. A test of a vetoed requirement retires with it.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0025_clean_state
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: "agent-proposal: first of architecture|project|waiver|quality|risk - veto or confirm"
graveyard: "true"
---

## Rationale (not load-bearing)
A test exists to verify a requirement. When the requirement is vetoed final, the test verifies nothing true. Keeping it forces the battery to fail forever on a selftest that rightly left the engine. The retro carries the wider lead: a lint family for ledger rot (missing selftests, tests of vetoed requirements, unrooted decisions).

## Graveyard note (why-not, queryable)

Retirement/veto record migrated as an anti-decision.
