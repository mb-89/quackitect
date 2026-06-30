---
id: req-unique-ids
type: requirement
refines: [uc-vendor-engine]
statement: Every node id is globally unique across the whole spec. The engine provides a deterministic id creator that namespaces a local name by its iteration tag, and a duplicate-id check that reports any collision. A reused id can never silently shadow another iteration's data.
depends_on: []
class: review
killer: true
---

## Rationale (not load-bearing)
M2 killer. Found during i0003 compose. The generic milestone ids (m1-gate) collide across iterations on the flat id keyspace, silently shadowing the earlier iteration on load. See adr-unique-ids.
