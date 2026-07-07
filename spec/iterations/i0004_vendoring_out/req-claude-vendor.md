---
id: req-claude-vendor
type: requirement
statement: `start init` vendors the .claude/ slash commands (engage, note, review) and settings into the vehicle, rewriting the dogfood method path product/quackitect/ to .quack/vendor/quackitect/ so the pointers resolve. Shipped this session.
depends_on: [req-vehicle-scaffold]
class: review
killer: false
ears: exempt - historical statement, retrofit rejected (adr-grandfathers-historical)
phase: [commissioning]
discipline: [software]
quality: [portability]
---
## Rationale (not load-bearing)
Grandfathered. Without it the agent can't drive the vehicle with /engage etc.
