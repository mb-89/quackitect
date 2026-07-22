---
id: se.adr-veto-kind-first-data
kind: anti_decision
statement: "A kind-first data layout (logs/<slug>, notes/<slug>) is scrapped: it scatters one workspace across kinds and breaks the one-delete amnesia test (i9 M3 axis A5b)."
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
---

## Rationale (not load-bearing)
The data home could group by kind first, then workspace: logs/<slug>, notes/<slug>.
That scatters one workspace's state across many top-level kind folders.
The amnesia test wants one delete to forget a workspace fully.
A kind-first layout needs a delete in every kind folder, so a stray folder survives.
Workspace-first, <slug>/<kind>, keeps one deletable directory per workspace.

## Graveyard note (why-not, queryable)

Retirement/veto record migrated as an anti-decision.
