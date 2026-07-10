---
id: req-ask-dispatch
type: requirement
depends_on: []
statement: When a gate ask or decision ask awaits adjudication and a device is paired, the engine shall send the ask to the paired device over every paired channel.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
The dispatch half of the loop (owner: full loop, notify-only overruled).
