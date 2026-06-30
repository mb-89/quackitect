---
id: req-claude-vendor
type: requirement
refines: [uc-ship-branded-engine]
statement: `start init` vendors the .claude/ slash commands (engage, note, review) and settings into the vehicle, rewriting the dogfood method path product/quackitect/ to .quack/vendor/quackitect/ so the pointers resolve. Shipped this session.
depends_on: [req-vehicle-scaffold]
class: review
killer: false
---
## Rationale (not load-bearing)
Grandfathered. Without it the agent can't drive the vehicle with /engage etc.
