---
id: req-contract-render
type: requirement
refines: [uc-contract-delivery]
statement: When entry-file rendering runs, the engine shall generate every harness entry file (AGENTS.md, .github/copilot-instructions.md) from contract.md as their single source.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Removes the pointer entirely: the maintainer runs the render; the agent only ever reads a static file that already contains the full contract. Per-harness framing (how each file wraps the contract) is template, the contract body is transcluded verbatim.
