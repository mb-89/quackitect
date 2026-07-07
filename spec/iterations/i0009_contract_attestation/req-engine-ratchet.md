---
id: req-engine-ratchet
type: requirement
statement: When a command runs against a workspace whose vendored engine source is newer than the global binary, quackitect shall rebuild the global binary from that source before executing the command.
depends_on: []
class: review
killer: false
phase: [commissioning]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
Ratchet (owner decision): a newer global binary is used as-is; an older one is rebuilt forward. No versioned slots, no downgrade path; incompatibility trouble is handled ad hoc by the LLM. Where the check lives (launcher vs engine self-check) is an M3/M4 axis.
