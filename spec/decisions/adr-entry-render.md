---
id: adr-entry-render
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: Harness entry files, AGENTS.md and .github/copilot-instructions.md, are rendered by the engine from contract.md. A per-harness template wraps the verbatim contract body, run by the maintainer inside `quack build` and standalone. `quack lint` re-renders and byte-compares to flag drift. This was chosen over pointers, since thin harnesses are proven not to follow them. It was also chosen over git-hook auto-render as the guarantee, since hooks do not fire everywhere and are kept only as optional convenience.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
A generated file is an output, not a duplicate — DRY holds with one authored source. The render also gives the vocabulary-sweep note a natural home: templates can reword framing without touching the contract body.
