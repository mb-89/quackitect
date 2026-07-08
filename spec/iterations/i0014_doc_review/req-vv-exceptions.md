---
id: req-vv-exceptions
type: requirement
depends_on: []
statement: The verification chapter shall open with a derived count of verified requirements and render each unverified requirement prominently before the full matrix.
class: review
killer: false
phase: [operation]
discipline: [software, design]
quality: [usability]
---
## Rationale (not load-bearing)
field c36 via req-compact-renders; agreed at the bs20 design discussion (2026-07-08). The shallow reader gets the verdict in seconds; the deep reader continues into the full matrix (need-paged, expandable rows per req-table-expand). Same lab rule as the results unit: no green ocean - the green mass is a count, the exceptions are the render. With zero exceptions the block is one green sentence.
