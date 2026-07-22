---
id: se.guidance
kind: decision
statement: "Guides load lazily through a description catalog. A guide body loads by trigger: always, by-type cascade, by-rigor ladder, browse, or check-recommended. The trigger resolves live off a type/rigor breadcrumb."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_type: requirement
v1_adjudicated_by: human
v1_killer: "true"
v1_ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
v2_amendment: pillar-1 catalog
---

## Rationale (not load-bearing)

Progressive disclosure keeps context cheap; the breadcrumb is the only thing the advice layer reads — the engine stays type-agnostic.

## v2 amendment (applied at mint)

pillar-1 catalog
