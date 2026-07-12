---
id: adr-schema-format
type: adr
kind: architecture
decided_in: i0018_mcp_apply
adjudicated_by: user
statement: Field schemas are FRONTMATTER-KEYED notes in the method layer (sebot shape: required, enum_<field>, pattern_<field>, min_/max_; a common schema merged with the per-type one; defaults live IN the schema). Datum: JSON config files under method/config (candidate 2B, the i17 retired-vocabulary precedent). Frontmatter wins on readability, the node-as-markdown ethos, and zero-dep parsing; JSON Schema is heavier than today's need. Recorded tripwire (sebot's): the day a rule needs conditionals or nesting, generate real JSON Schema from the frontmatter - frontmatter stays the authored source.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
