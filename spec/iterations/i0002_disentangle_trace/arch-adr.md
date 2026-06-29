---
id: arch-adr
type: adr
addresses: [req-split]
statement: The chosen trace architecture is the FIXED 5-layer V-model (option A). It is recorded as an ADR (context, options, decision, consequences), traced to the criteria. Depth is fixed. That is a discipline, not a limit. Edges use a single refines field. A requirement is tagged functional or non-functional. Tasks are prefixed and separate. Milestones are derived reachability-coverage gates. Quackitect's own spec is retyped into it. The dogfood is required.
depends_on: [arch-candidates]
class: review
killer: true
---

## Rationale (not load-bearing)
M4 killer. Full ADR: design/M4-ADR.md. Supersedes the earlier task->design `implements` link.
