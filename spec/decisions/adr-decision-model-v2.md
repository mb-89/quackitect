---
id: adr-decision-model-v2
type: adr
addresses: [req-decisions-folder, req-decision-classes, req-parked-list, req-decision-realized-lint]
adjudicated_by: human
statement: Decisions are immutable nodes in one folder — spec/decisions/, forward-only from i0009 with prior iteration-folder ADRs grandfathered — born made, never edited, exiting only by supersession, classified purely from graph facts (veto = scrap-sink edge, defer = scrap edge with ready_when, superseded = incoming supersedes edge) with the killer stamp remaining a person's judgment — chosen over the industry four-state status lifecycle, which would duplicate the gate ledger's state machine.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Settled with the owner 2026-07-03 (researched, red-teamed), adopted here. Dogfood from birth: this very file and its five siblings are the first citizens of spec/decisions/. The M3 graveyard entries (chat-relayed grant, pointer entry files, key files, status-field lifecycle, kind-first layout) become veto nodes when the scrap sink ships in M6 — the sink is engine-built-in, so minting them earlier would break ref-integrity.
