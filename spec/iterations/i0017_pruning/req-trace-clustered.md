---
id: req-trace-clustered
type: requirement
depends_on: []
statement: The trace shall carry clustered requirements where concerns belong tightly together. Each clustered statement stays individually sub-addressable for tracing and verification, and tests stay more atomic than requirements. The migrated spec shall hold materially fewer requirement nodes than the 2026-07-10 baseline.
class: review
killer: false
---
## Rationale (not load-bearing)
Owner rulings 2026-07-10: one requirement may carry several singular shall-statements, numbered (req-x.1, req-x.2); a requirement passes when ALL its tests pass (tests are the atomic layer); the trace-graph RENDER compacts alongside the data. The ISO 29148 singularity divergence is deliberate and mitigated at statement level.
