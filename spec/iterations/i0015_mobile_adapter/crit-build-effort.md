---
id: crit-build-effort
type: criterion
weight: 0.5
metric: estimated adapter lines and moving parts
statement: The axis weighs the adapter size and its failure surface.
class: review
killer: false
---
## Rationale (not load-bearing)
Weight 0.5 (M3). Scale anchors - 1.0: under 100 lines, one protocol; 0.9: ~150 lines of plain HTTP; 0.3: ~400+ lines with connection lifecycle (websocket framing, reconnects, pings).
