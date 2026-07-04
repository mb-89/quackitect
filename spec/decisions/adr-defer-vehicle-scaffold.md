---
id: adr-defer-vehicle-scaffold
type: adr
addresses: [scrap, scrap]
adjudicated_by: human
ready_when: the first real vehicle needs re-scaffolding after i0009 (start init, integrate.md, stubs still scaffold the legacy .quack layout; the global-ratchet world needs tools/engine vendoring + spec/project.toml + global-bin launcher)
statement: Vehicle scaffolding modernization is parked: start init, integrate.md and the drive-from-inside stubs still emit the legacy .quack vehicle layout, which keeps working through the engine's legacy fallbacks (root marker, overlay, vendor resolution) — reworking them to the no-.quack world is deferred, not dead.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO
