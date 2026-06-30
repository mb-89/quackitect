---
id: req-responsiveness
type: requirement
refines: [uc-run-dep-free, uc-review-report]
statement: Every user interaction produces visible feedback within 1 second on a 2025 mid-range laptop. If the work takes longer, an acknowledgement appears first within that second (for example started computing). A long-running task reports progress at least once per minute. The more frequent and interactive an interaction, the more it overachieves this bound, where that needs no major architecture rework and degrades no other design goal. This binds the engine and the output it produces.
depends_on: []
class: review
killer: false
---

## Rationale (not load-bearing)
M2 non-functional requirement. Subsumes the startup-speed motivation of the Go port as one instance of a general fast-tooling goal. The durable principle is guides/responsiveness.md (scope: always), so it also binds future iterations and vehicles. The Go binary makes the 1-second bound easy for the engine; the report trace-filter (client-side) keeps the output instant.
