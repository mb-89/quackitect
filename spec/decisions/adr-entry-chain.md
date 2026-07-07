---
id: adr-entry-chain
type: adr
adjudicated_by: human
statement: Entry files are hand-authored pointers, not renders: CLAUDE.md and .github/copilot-instructions.md command following AGENTS.md without exception and to the letter; AGENTS.md commands the enumerated read-understand-recite-honor ritual on contract.md, the contract single copy. The render pipeline (templates, render-entry, drift lint) is removed; quack selftest guards the chain instead.
class: review
killer: false
---
## Rationale (not load-bearing)
The render kept DRY at authoring time but still put N copies of the body in front of agents,
and field data showed the embedded copy does not produce the recital anyway. In pointer form
DRY holds everywhere: one body, and every entry file is a short chain of active commands. The
old drift lint made sense for generated files; hand-authored pointers need a chain check
instead, which the two repurposed selftests provide.
