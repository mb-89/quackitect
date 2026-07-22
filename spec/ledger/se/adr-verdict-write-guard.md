---
id: se.adr-verdict-write-guard
kind: decision
statement: Battery trust guards wrap the single verdict-write path.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0022_engine_laws
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: agent-proposal at i22 M4
v1_provenance_adjudicated_by: grant-covered at i22 M4; the morning review confirms
---

## Rationale (not load-bearing)
The busy-no-record and first-green guards wrap the ONE function that writes a
verdict into the cache. The rejected alternative - per-test self-checks - is the
documented i21 failure mode (raid-busy-record): the deck-goto test guarded itself
and still poisoned the cache. A guard at the write point cannot be forgotten by
the next test author. Shapes go-verdict-guard in model-guard-tree.
