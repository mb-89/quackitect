---
id: se.adr-comment-anchoring
kind: decision
statement: Anchors are a unit-anchor id plus W3C quote and position selectors, valid within the one copy they were made in. Raw offsets and node paths are rejected as unreadable and brittle. No cross-version re-anchoring exists. fdf-style loss is accepted. A premark target is the same schema with the selectors absent.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_decided_in: i0013_comments
v1_type: adr
v1_kind: architecture
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
p3_note: comment layer
---

## Rationale (not load-bearing)
The quote doubles as human-readable context at triage. The M2 probe confirmed stable unit ids in the shipped book.
