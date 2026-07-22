---
id: se.adr-schema-format
kind: decision
statement: "Field schemas are FRONTMATTER-KEYED notes in the method layer, the sebot shape: required, enum_<field>, pattern_<field>, min_/max_. A common schema merges with the per-type one, and defaults live IN the schema. Datum: JSON config files under method/config (candidate 2B, the i17 retired-vocabulary precedent). Frontmatter wins on readability, the node-as-markdown ethos, and zero-dep parsing; JSON Schema is heavier than today's need. Recorded tripwire, sebot's: the day a rule needs conditionals or nesting, generate real JSON Schema from the frontmatter. Frontmatter stays the authored source."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_kind: architecture
v1_decided_in: i0018_mcp_apply
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: evidence forms build on it
---

## Rationale (not load-bearing)
Not applicable - the decision body above carries the options and the reasoning; this slot adds nothing.
