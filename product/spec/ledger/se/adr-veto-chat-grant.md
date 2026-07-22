---
id: se.adr-veto-chat-grant
kind: anti_decision
statement: Chat-relayed grants, an agent flag standing in for a person's authorization, are scrapped. There is no structural proof a person acted. That is the exact failure the attestation gate exists to close (i9 M3 axis A1b/c).
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
p3_note: "OWNER RULING: superseded, further than proposed — delegated adjudication is a designed feature. Gates (killer gates included) may be agent-blessed when policy/run enables it; grants record adjudicated_by + channel, transparently queryable; owner reviews at run end and must always have the OPTION of absence. v1's veto survives only as the transparency requirement, not as a ban."
---

## Rationale (not load-bearing)
An early idea let the agent pass a flag to say a person had authorized a step.
A flag set by the agent proves nothing about a person.
The attestation gate exists to give a structural proof that a person acted.
A relayed grant reopens the exact gap the gate was built to close.
So authorization must come through the grant-challenge-key ritual, never a chat-relayed flag.

## Graveyard note (why-not, queryable)

OWNER RULING: superseded, further than proposed — delegated adjudication is a designed feature. Gates (killer gates included) may be agent-blessed when policy/run enables it; grants record adjudicated_by + channel, transparently queryable; owner reviews at run end and must always have the OPTION of absence. v1's veto survives only as the transparency requirement, not as a ban.
