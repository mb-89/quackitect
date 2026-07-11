---
id: adr-veto-chat-grant
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: Chat-relayed grants (an agent flag standing in for a person's authorization) are scrapped: no structural proof a person acted — the exact failure the attestation gate exists to close (i9 M3 axis A1b/c).
class: review
killer: false
---
## Rationale (not load-bearing)
An early idea let the agent pass a flag to say a person had authorized a step.
A flag set by the agent proves nothing about a person.
The attestation gate exists to give a structural proof that a person acted.
A relayed grant reopens the exact gap the gate was built to close.
So authorization must come through the grant-challenge-key ritual, never a chat-relayed flag.
