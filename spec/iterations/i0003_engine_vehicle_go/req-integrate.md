---
id: req-integrate
type: requirement
refines: [uc-vendor-engine]
statement: An external vehicle can integrate quackitect as an engine with a documented path. There is an integrate prompt with a worked example (vendor the engine source + resources, build, configure, overlay, run). The engine's resource lookup (gather, guides, the report shell) routes through the overlay chain, so a vendored vehicle resolves the engine's rigor and type resources without any hardcoded dogfood path. Saying to a vehicle "run on quackitect as an engine, integrate it" works.
depends_on: [req-overlay-resolver]
class: review
killer: true
---

## Rationale (not load-bearing)
Captured backward at M7 validation: a scaffolded vehicle ran `quack status` but `quack gather` returned 0 — resource lookup was hardcoded to product/quackitect (dogfood), so a vendored vehicle could not find the engine's resources. The overlay resolver existed but gather did not route through it. The integration onboarding was wrongly deferred; it is core to need-engine-reuse.
