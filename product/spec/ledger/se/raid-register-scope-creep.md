---
id: se.raid-register-scope-creep
kind: raid
statement: "The register grows into a parallel UI system: its own renderer, its own answer path, its own state. This happens instead of unifying with the existing ask/bless machinery."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_type: raid
v1_kind: risk
v1_probability: 0.6
v1_impact: 0.5
v1_mitigation: the M3 candidates step bounds the register to ONE placement; the fill/adjudicate UI unifies with the EXISTING ask path instead of growing a parallel one; two-model budget at M4
v1_owner: driving agent
v1_status: open
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
The register seed demands unification (register view, ask loop, questionnaires = one system).
Every prior surface that grew beside an existing one (deck vs book rails, i19-i20) cost a
consistency sweep later.
