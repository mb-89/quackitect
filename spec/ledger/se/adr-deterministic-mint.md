---
id: se.adr-deterministic-mint
kind: decision
statement: Node and note creation is engine-owned. `quack mint <type>` emits schema-valid skeletons, with sugar forms mint veto, mint defer --ready-when, and mint supersede stamping the classification edges. The note skill calls the engine's note lane, with a multi-line body via file or stdin, instead of hand-writing files. This was chosen over graduation-only minting, which conflates the private note lane with trace minting and has no path for tests or requirements.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0009_contract_attestation
v1_type: adr
v1_adjudicated_by: human
v1_depends_on: []
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Moves the strict parser's guarantee from read time to birth time. The sebot determinizer precedent, applied. This session's hand-written notes are the drift it removes.
