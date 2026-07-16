---
id: adr-pointer-entry-unveto
decided_in: i0010_engine_workshop
type: adr
adjudicated_by: human
statement: The pointer-entry scrap is lifted. Field data showed Claude Code natively loads CLAUDE.md, not AGENTS.md, and a weak model with the full contract embedded still skipped the recital. Transclusion never was the enforcement. Since i9, attest blocks the ledger structurally. Pointers return as an enumerated command chain (adr-entry-chain).
class: review
killer: false
---
## Rationale (not load-bearing)
The i6 veto rested on one data point (Copilot ignored a passive pointer) and predates attest.
Two things changed: the primary harness (Claude Code) turned out to load CLAUDE.md, not
AGENTS.md — so the "native channel" premise of transclusion was already broken — and attest
now makes the ledger unusable without the live contract text in hand, which is a structural
guarantee no entry-file wording can match. Residual risk accepted: an agent that never touches
the ledger and ignores the chain sees no contract text; the chain therefore stays active
imperatives, never bare links.
