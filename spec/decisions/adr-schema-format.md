---
id: adr-schema-format
type: adr
kind: architecture
decided_in: i0018_mcp_apply
adjudicated_by: user
statement: Field schemas are FRONTMATTER-KEYED notes in the method layer, the sebot shape: required, enum_<field>, pattern_<field>, min_/max_. A common schema merges with the per-type one, and defaults live IN the schema. Datum: JSON config files under method/config (candidate 2B, the i17 retired-vocabulary precedent). Frontmatter wins on readability, the node-as-markdown ethos, and zero-dep parsing; JSON Schema is heavier than today's need. Recorded tripwire, sebot's: the day a rule needs conditionals or nesting, generate real JSON Schema from the frontmatter. Frontmatter stays the authored source.
class: review
killer: false
---
## Rationale (not load-bearing)
Not applicable - the decision body above carries the options and the reasoning; this slot adds nothing.
