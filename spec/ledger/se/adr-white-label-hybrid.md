---
id: se.adr-white-label-hybrid
kind: decision
statement: The white-label mechanism is hybrid. The renderer takes the identity surfaces, title, wordmark, colophon, from the workspace's brand layer. The method prose is written brand-neutral where it speaks self-referentially. Render-time prose substitution is rejected, since rewriting text the ledger hashes would hide content from the trust chain.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_kind: architecture
v1_decided_in: i0019_strangers_book
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Pugh winner over renderer-only substitution (M3 fork C); the identity surfaces are mechanical and testable, the voice fix is honest prose, hash-honesty preserved.
