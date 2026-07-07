---
id: guidance
statement: Guides load lazily through a description catalog. A guide body loads by trigger: always, by-type cascade, by-rigor ladder, browse, or check-recommended. The trigger resolves live off a type/rigor breadcrumb.
type: requirement
adjudicated_by: human
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
---

## Rationale (not load-bearing)

Progressive disclosure keeps context cheap; the breadcrumb is the only thing the advice layer reads — the engine stays type-agnostic.
