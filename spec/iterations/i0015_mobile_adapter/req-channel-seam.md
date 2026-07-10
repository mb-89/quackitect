---
id: req-channel-seam
type: requirement
depends_on: []
statement: Where a new channel is added, the engine shall require an adapter behind the ask seam and no change to the ask loop.
class: review
killer: false
phase: [operation]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
The corporate adapters (Teams, Outlook-COM) must drop in later without rework (owner: wanted soon).
