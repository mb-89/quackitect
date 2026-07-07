---
id: adr-entry-render
type: adr
adjudicated_by: human
statement: Harness entry files (AGENTS.md, .github/copilot-instructions.md) are rendered by the engine from contract.md — a per-harness template wrapping the verbatim contract body, run by the maintainer inside `quack build` and standalone, with `quack lint` re-rendering and byte-comparing to flag drift — chosen over pointers (thin harnesses proven not to follow them) and over git-hook auto-render as the guarantee (hooks do not fire everywhere; kept only as optional convenience).
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
A generated file is an output, not a duplicate — DRY holds with one authored source. The render also gives the vocabulary-sweep note a natural home: templates can reword framing without touching the contract body.
