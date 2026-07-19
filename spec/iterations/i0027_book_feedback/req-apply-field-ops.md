---
id: req-apply-field-ops
type: requirement
depends_on: []
statement: The apply lane shall edit a single scalar frontmatter field structure-aware (replace in place or insert into the block), leaving every other byte untouched.
class: review
killer: false
kind: functional
provenance:
  statement: owner ruling 2026-07-19 - the vault tools' AST-safe frontmatter handling, learned into quack apply instead of adopting a dependency
  class: schema-default (review)
  killer: schema-default (false)
  kind: functional
---
## Rationale (not load-bearing)
Byte-exact old-text matching is brittle for frontmatter surgery; the field is the unit the editor thinks in. Nested blocks refuse - scalar surgery only, sized to this spec's flat frontmatter.
