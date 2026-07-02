---
id: adr-actor-channel-stat
type: adr
addresses: [req-actor-channels]
adjudicated_by: human
statement: The bless channel is detected by stdlib char-device stat on stdin+stdout (console = human, pipe/redirect = agent), overridden by an explicit --by flag; QUACK_ACTOR is retired — chosen over env heuristics (spoofable, nondeterministic) and over always-agent (worst console UX). The known MSYS/mintty pipe quirk mis-stamps toward agent, the designed-harmless direction (under-claims human oversight).
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Sensitivity: if the M5 terminal spike falsifies char-device detection on real Windows consoles, fallback is always-agent + --by human (C2c) — the record stays honest either way; only convenience is lost.
