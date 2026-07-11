---
id: adr-veto-pointer-entry
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: Pointer-based entry files (AGENTS.md pointing at contract.md) are scrapped: thin harnesses do not follow pointers — field-proven at i6 (Copilot) and the origin of req-contract-render (i9 M3 axis A4b).
class: review
killer: false
---
## Rationale (not load-bearing)
The entry chain leaned on a passive pointer from AGENTS.md to the contract.
At i6 a thin harness ignored that pointer, so the contract never loaded.
A pointer only works if the harness chooses to follow it.
This failure created req-contract-render, the requirement that the entry chain be verified.
The scrap was later lifted once attest made the ledger unusable without the contract text (adr-pointer-entry-unveto).
