---
id: adr-comment-anchoring
decided_in: i0013_comments
type: adr
kind: architecture
adjudicated_by: user
statement: Anchors are unit-anchor id + W3C quote and position selectors, valid within the one copy they were made in; raw offsets and node paths are rejected as unreadable and brittle. No cross-version re-anchoring exists - fdf-style loss is accepted; a premark target is the same schema with the selectors absent.
class: review
killer: false
---
## Rationale (not load-bearing)
The quote doubles as human-readable context at triage. The M2 probe confirmed stable unit ids in the shipped book.
