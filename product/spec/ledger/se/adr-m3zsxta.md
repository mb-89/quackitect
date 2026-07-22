---
id: se.adr-m3zsxta
kind: decision
statement: "The engine binary embeds no data: no go:embed corpus, no frozen template or method copy. Every resource resolves from the live layer beside the binary (the vendored source, the method overlay, the workspace). An embedded copy freezes at compile time and drifts from the layer it copied. The live layer is the single source. Owner ruling 2026-07-16, recorded as rule-no-embedded-data."
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
p3_note: grouped with rules-as-config
---

## Rationale (not load-bearing)
The ratchet promises that the global binary is always rebuildable from the vendored source (req-engine-distribution). Embedded data would break that promise sideways: the binary would carry a second, frozen copy of content the live layer owns, and the two would drift with no test watching. The rule (rule-no-embedded-data) makes the choice binding for detailed design. Recorded during the i25 drain; the engine already conformed.
