---
id: se.adr-pointer-entry-unveto
kind: decision
statement: The pointer-entry scrap is lifted. Field data showed Claude Code natively loads CLAUDE.md, not AGENTS.md, and a weak model with the full contract embedded still skipped the recital. Transclusion never was the enforcement. Since i9, attest blocks the ledger structurally. Pointers return as an enumerated command chain (adr-entry-chain).
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: human
edges:
  supersedes: [se.adr-veto-pointer-entry]
v1_decided_in: i0010_engine_workshop
v1_type: adr
v1_adjudicated_by: human
v1_class: review
v1_killer: "false"
p3_note: field-proven; pairs with anti-kept adr-veto-pointer-entry
---

## Rationale (not load-bearing)
The i6 veto rested on one data point (Copilot ignored a passive pointer) and predates attest.
Two things changed: the primary harness (Claude Code) turned out to load CLAUDE.md, not
AGENTS.md — so the "native channel" premise of transclusion was already broken — and attest
now makes the ledger unusable without the live contract text in hand, which is a structural
guarantee no entry-file wording can match. Residual risk accepted: an agent that never touches
the ledger and ignores the chain sees no contract text; the chain therefore stays active
imperatives, never bare links.
