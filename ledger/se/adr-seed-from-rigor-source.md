---
id: se.adr-seed-from-rigor-source
kind: decision
statement: "quack start seeds the checklist by PARSING THE RIGOR SOURCE at seed time, method/rigor/<rigor>/checklist.md plus the shared implementation fragment. It emits gates and subtasks with iteration-namespaced ids and milestone-monotonic wiring. Datum: shipping literal task-file templates and copying them (C2). Copy loses because it bakes a second milestone truth and realizes raid-seeding-drift by construction. Parse-at-seed keeps the checklist the single source, so a template change reaches the next start with no migration. Reverse-sensitivity: if checklist prose proves unparseable without fragile heuristics at the M5 spike, C2 returns WITH a drift lint as the mitigation."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0021_field_ux
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v2_amendment: re-expressed over v2's policy/state-machine (design §6/§12)
---

## Rationale (not load-bearing)
Not applicable - the decision body above carries the options and the reasoning; this slot adds nothing.

## v2 amendment (applied at mint)

re-expressed over v2's policy/state-machine (design §6/§12)
