---
id: req-actor-channels
type: requirement
refines: [uc-honest-adjudication]
statement: When a bless is recorded, the engine shall default the actor per channel — human for a bless entered at an interactive console, agent for a non-interactive harness-invoked bless — and shall accept an explicit --by flag overriding either; the QUACK_ACTOR environment variable shall be retired.
depends_on: []
class: review
killer: true
---
