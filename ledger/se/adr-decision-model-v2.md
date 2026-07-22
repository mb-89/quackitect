---
id: se.adr-decision-model-v2
kind: decision
statement: "Decisions are immutable nodes in one folder, spec/decisions/, forward-only from i0009 with prior iteration-folder ADRs grandfathered. They are born made, never edited, and exit only by supersession. Classification derives purely from graph facts: veto is a scrap-sink edge, defer is a scrap edge with ready_when, superseded is an incoming supersedes edge. The killer stamp remains a person's judgment. This was chosen over the industry four-state status lifecycle, which would duplicate the gate ledger's state machine."
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
v1_killer: "true"
p3_note: immutable, born made, exit by supersede
---

## Rationale (not load-bearing)
Settled with the owner 2026-07-03 (researched, red-teamed), adopted here. Dogfood from birth: this very file and its five siblings are the first citizens of spec/decisions/. The M3 graveyard entries (chat-relayed grant, pointer entry files, key files, status-field lifecycle, kind-first layout) become veto nodes when the scrap sink ships in M6 — the sink is engine-built-in, so minting them earlier would break ref-integrity.
