---
id: req-observe-red-refresh
type: requirement
depends_on: []
statement: When observe-red --refresh runs on a test that still fails, the engine shall re-record the red attestation at the test's current hash.
class: review
killer: false
phase: [maintenance]
discipline: [software]
quality: [functionality]
---
## Rationale (not load-bearing)
i12 method lead: amending a statement after observe-red strands the red record. The ordering rule is harvested into engage.md; this is the tool half. A refresh on a PASSING test stays refused.
