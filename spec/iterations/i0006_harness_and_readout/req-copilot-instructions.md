---
id: req-copilot-instructions
type: requirement
refines: [uc-harness-portability]
statement: The repo carries .github/copilot-instructions.md (Copilot's native instruction channel) delivering the contract to the agent, single-sourced from contract.md (not a hand-maintained fork), so Copilot receives the binding rules without loading AGENTS.md or following a pointer.
class: review
killer: false
---
## Rationale (not load-bearing)
i0006 requirement under uc-harness-portability.
