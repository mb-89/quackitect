---
id: adr-brand-overlay
type: adr
statement: Brand (the design language — voice + logos + palette + type) is an OVERLAY-resolved resource, not a ship-time transform. The engine's default brand is generic (generic voice + logo placeholders) under product/; quackitect's own brand (duck + voice) lives in quackitect's .quack/overlay, so quack ship naturally packages a brand-neutral engine. Deleting a vehicle's brand files falls back to the engine default through the normal resolver.
addresses: [req-design-language]
adjudicated_by: human
killer: false
---
## Rationale (not load-bearing)
Avoids ship-time magic; reuses the i4 resolver. "Delete to fall back" is just resolution.
