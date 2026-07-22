---
id: se.adr-standalone-suite
kind: decision
statement: "Test nodes may carry suite: never-cached in their frontmatter: the tests-pass battery skips them and the board carries them as their own entry. The parity tamper check moves to this suite. Chosen over a hardcoded name filter (not generic) and over retiring the i3 test node (history churn without benefit)."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0011_geronticide
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
p3_note: merged with yijggxq rename
---

## Rationale (not load-bearing)
The tripwire keeps ALL its teeth - it just stops biting the verification suites for legitimate authoring.
