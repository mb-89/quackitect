---
id: se.adr-fail-at-end
kind: decision
statement: "The battery collects failures and reports them once, at the end. The runner loop keeps a failure list instead of exiting at the first red. The verdict cache stays the crash-surviving partial store. Datum: a verdict journal file. It loses on simplicity; the cache already survives crashes. This mechanizes the owner's law: discover once, fix batched, confirm once."
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
v1_provenance_kind: agent-proposal - architecture, shapes the battery runner
---


