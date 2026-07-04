---
id: uc-global-engine
type: usecase
refines: [need-workspace-drive]
statement: One global quack binary serves every repo; a repo carries vendored engine source and can rebuild the global binary, ratcheting it forward — a newer global binary is used as-is, an older one is rebuilt.
class: review
killer: false
---
## Rationale (not load-bearing)
The owner's informal call 2026-07-04 (formal killer ADR at M4): no versioned slots, forward-only ratchet; incompatibility trouble is handled ad hoc by the LLM proposing a fix. Ship-a-zip stays viable: the launcher builds the global binary from vendored source when absent.
