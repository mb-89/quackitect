---
id: req-vendor-layout
type: requirement
refines: [uc-ship-branded-engine]
statement: The engine is vendored under .quack/vendor/ mirroring quackitect's product/ 1:1 (engine-go source + quackitect resources + assets). Resource and source lookup resolve vendor-first with a dogfood product/ fallback (EngineDir/EngineSrc), so a vehicle never inherits a hardcoded dogfood path. Shipped this session.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
Grandfathered. Closes the ship->integrate loop (ship zips product/; unzip into .quack/vendor/).
