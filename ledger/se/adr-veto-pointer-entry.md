---
id: se.adr-veto-pointer-entry
kind: anti_decision
statement: Pointer-based entry files, AGENTS.md pointing at contract.md, are scrapped. Thin harnesses do not follow pointers. This was field-proven at i6 (Copilot) and is the origin of req-contract-render (i9 M3 axis A4b).
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
v1_decided_in: i0009_contract_attestation
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
graveyard: "true"
p3_note: pairs with its unveto — the pair is the story
---

## Rationale (not load-bearing)
The entry chain leaned on a passive pointer from AGENTS.md to the contract.
At i6 a thin harness ignored that pointer, so the contract never loaded.
A pointer only works if the harness chooses to follow it.
This failure created req-contract-render, the requirement that the entry chain be verified.
The scrap was later lifted once attest made the ledger unusable without the contract text (adr-pointer-entry-unveto).

## Graveyard note (why-not, queryable)

pairs with its unveto — the pair is the story
