---
id: raid-timing-tests
type: raid
statement: The hand-off lifecycle tests run real millisecond timings. Under heavy CPU load a watchdog window can flake the battery.
kind: risk
probability: 0.2
impact: 0.3
mitigation: The sorted battery and n/N lines name a flaking test directly; a rerun via quack verify re-records it; widen the fixture windows if it flakes twice.
owner: the driving agent
status: open
killer: false
provenance:
  mitigation: user-ruling via handoff
---
