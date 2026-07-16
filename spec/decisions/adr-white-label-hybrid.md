---
id: adr-white-label-hybrid
type: adr
kind: architecture
decided_in: i0019_strangers_book
adjudicated_by: user
statement: The white-label mechanism is hybrid. The renderer takes the identity surfaces, title, wordmark, colophon, from the workspace's brand layer. The method prose is written brand-neutral where it speaks self-referentially. Render-time prose substitution is rejected, since rewriting text the ledger hashes would hide content from the trust chain.
class: review
killer: false
---
## Rationale (not load-bearing)
Pugh winner over renderer-only substitution (M3 fork C); the identity surfaces are mechanical and testable, the voice fix is honest prose, hash-honesty preserved.
