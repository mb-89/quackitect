---
id: adr-unique-ids
type: adr
statement: Guarantee node-id uniqueness by namespacing task ids with the iteration tag at creation (mint_id, i0003 to i3-) plus a deterministic duplicate-id check that reports any collision. Adapted from the sebot determinizer mint tool (a shorthand plus a zero-padded counter); quackitect namespaces by iteration rather than by type, because the collision is iteration-scoped (generic milestone ids like m1-gate). Rejected the alternative of auto path-qualifying ids inside the resolver, a larger semantic change that is risky right before the Go port.
addresses: [req-unique-ids]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)
i0003. The stopgap (mint_id, duplicate_ids, the lint guard) lands in the current Python engine now so the i0003 build cannot lose data. The Go port carries the same guarantee.
