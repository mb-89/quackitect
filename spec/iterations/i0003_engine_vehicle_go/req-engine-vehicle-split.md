---
id: req-engine-vehicle-split
type: requirement
refines: [uc-vendor-engine]
statement: product separates into a read-only ENGINE and a VEHICLE. The engine holds the logic plus default resources (method and project_types). The vehicle holds quackitect's own spec, .quack, and identity files (README, AGENTS, voice). A vehicle run never writes under the engine. The vehicle overrides resources by overlay, never by editing engine files.
depends_on: []
class: review
killer: true
---

## Rationale (not load-bearing)
M2 killer. The separation is the iteration's structural core. quackitect's repo becomes a vehicle of its own engine (dogfood).
