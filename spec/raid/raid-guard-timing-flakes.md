---
id: raid-guard-timing-flakes
type: raid
kind: risk
probability: 0.3
impact: 0.3
mitigation: Tests assert order and overlap, never durations. Fixture windows stay wide. A flake re-records through quack verify. The precedent is raid-timing-tests (i21).
owner: the driving agent
status: open
statement: The progress and concurrency tests measure timing. Heavy load can flake them in the battery.
class: review
killer: false
provenance:
  class: schema-default (review)
  impact: schema-default (0.5)
  killer: schema-default (false)
  kind: schema-default (risk)
  mitigation: agent-proposed at i22 M1
  owner: agent-proposed at i22 M1
  probability: agent-proposed at i22 M1
  status: schema-default (open)
---
## Rationale (not load-bearing)
i21's hand-off lifecycle tests already flaked under load once. The concurrency
test (req-battery-parallel) is the same class. Design the assertions load-proof.
