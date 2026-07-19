---
id: test-toc-order
type: test
statement: The toc manifest reorders the chapters, an unlisted chapter appends at the end visibly, and without a toc the order slots rule unchanged.
class: executed
verify: selftest:toc-order
killer: false
provenance:
  statement: agent-authored at the layout rework per the owner ruling
  class: schema-default (executed)
  killer: schema-default (false)
  verify: agent-authored
---
## Rationale (not load-bearing)
Red-teamed at design: asserting only the reorder passes while the no-toc fallback breaks, so both lanes are pinned on one fixture.
