---
id: req-console-exempt
type: requirement
statement: While a command arrives on the interactive console channel, the engine shall require no attestation.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Humans are never gated by their own contract machinery. Channel detection is the i8 char-device stat; its known MSYS quirk errs toward agent — the harmless direction (over-asks, never under-asks).
