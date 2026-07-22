---
id: se.adr-guard-dispatch-layer
kind: decision
statement: Command guards live in ONE dispatch-layer pass, never per handler.
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
The Pugh run (M4-decision.md) chose the dispatch layer over per-command guards
(the datum, today's de-facto pattern) and over a config-interpreted policy. The
deciding criteria: coverage uniformity (a new command is guarded by default) and
trust (one tested predicate set, no wording drift). Tripwire, recorded: a rule
table past ten per-command entries means the layer has become per-command logic
in disguise - revisit. Shapes elem-command-guards in model-guard-tree.
