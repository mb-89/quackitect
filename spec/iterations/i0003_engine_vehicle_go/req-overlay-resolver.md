---
id: req-overlay-resolver
type: requirement
refines: [uc-vendor-engine]
statement: One resolver walks the vehicle-to-engine chain. The most-specific layer wins. An un-overridden resource is inherited from the engine. The command surface, guides, the report shell, and gather all resolve their resources through this one resolver.
depends_on: [req-engine-vehicle-split]
class: review
killer: true
---

## Rationale (not load-bearing)
M2 killer. gather is already a proto-resolver. This generalizes it into the single resolution chain.
