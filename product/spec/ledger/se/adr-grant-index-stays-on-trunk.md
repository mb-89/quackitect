---
id: se.adr-grant-index-stays-on-trunk
kind: decision
statement: "The grant ledger stays on trunk as a THIN INDEX - iteration, state, hash, channel, adjudicator, evidence pointer - even though a gate record is otherwise an event, because it is what keeps the archive discoverable and answers the common audit questions without walking N tags. Owner ruling, 2026-07-25, with an explicit condition: it remains an index and never grows content. If briefs or evidence ever land inline, the exception is void and the file moves off trunk."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: Closed iterations vanish from every listing the moment their files leave trunk, and the cheapest cross-iteration audit questions require walking every tag.
---


