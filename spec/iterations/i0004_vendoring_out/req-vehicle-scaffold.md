---
id: req-vehicle-scaffold
type: requirement
statement: `quack start init <target>`, run from a quackitect checkout, scaffolds a vehicle at the target — vendors product/ into .quack/vendor/, copies the binary, writes config + launcher + AGENTS, lays down empty product/ + spec/, and never mints an iteration or fills the spec. Shipped this session.
depends_on: [req-vendor-layout]
class: review
killer: true
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [commissioning]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
Grandfathered. The one-command onboarding the i3 handover carried forward.
