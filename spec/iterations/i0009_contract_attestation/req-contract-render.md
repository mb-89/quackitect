---
id: req-contract-render
type: requirement
statement: The repository shall deliver the contract through an unbroken pointer chain with contract.md as its single copy — each harness's natively-loaded file (CLAUDE.md for Claude Code, .github/copilot-instructions.md for Copilot) commands following AGENTS.md without exception and to the letter, and AGENTS.md commands the enumerated read-understand-recite-honor ritual on contract.md.
depends_on: []
class: review
killer: true
phase: [engineering]
discipline: [process]
quality: [functionality]
---
## Rationale (not load-bearing)
Supersedes the verbatim-transclusion render (adr-entry-render, now superseded). Two field
findings moved it: Claude Code auto-loads CLAUDE.md, not AGENTS.md — the "native channel"
assumption was wrong for the primary harness; and a weak model with the full contract embedded
in context still skipped the recital — embedding never was the enforcement. Enforcement is
structural since i9: attest BLOCKS the ledger until the challenge is answered from the live
contract text, so the chain's job is a clear, enumerated command sequence, not carrying the
body. The body rides in exactly one file; entry files are hand-authored and small.
