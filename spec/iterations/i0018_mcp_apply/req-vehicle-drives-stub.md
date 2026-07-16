---
id: req-vehicle-drives-stub
type: requirement
depends_on: []
statement: The engine shall let a vehicle carry committed method extensions and drive the stubs it creates with them. The numbered statements bind individually.
class: review
killer: false
---
## Statements
1. When a vehicle commits a method resource under its own product overlay (product/&lt;brand&gt;/method mirroring the engine layout), the engine shall resolve that resource before the vendored engine layer, so the extension travels with the vehicle's repository.
2. When start stubs creates a workspace, the engine shall record the creating workspace's engine home in the stub's data home, and engine-root resolution shall prefer that per-stub record over the machine-global pointer, so a vehicle-created stub resolves the vehicle's merged methods.
3. If a workspace does not carry the engine source (product/engine-go), then the engine shall not re-record the machine-global engine home from it, so a vehicle with committed overrides never captures the pointer other workspaces resolve through.

## Rationale (not load-bearing)
The owner's field case: on a second machine, a vehicle carries IP-restricted methods (IEC norms)
quackitect cannot contain; the vehicle creates and drives stubs that see the merged method surface.
Statement 3 closes the pointer-hijack hazard the M7 validation walk demonstrated live: a
product/quackitect/method override made a scratch vehicle steal the machine-global engine home.
