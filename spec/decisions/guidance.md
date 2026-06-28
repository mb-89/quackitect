---
id: guidance
statement: Guides are lazily loaded via a description catalog; bodies load by four triggers (always, by-type cascade, by-rigor ladder, browse, check-recommended), resolved live off a type/rigor breadcrumb.
depends_on: [planning]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Progressive disclosure keeps context cheap; the breadcrumb is the only thing the advice layer reads — the engine stays type-agnostic.
