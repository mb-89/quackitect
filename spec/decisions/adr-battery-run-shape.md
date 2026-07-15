---
id: adr-battery-run-shape
type: adr
decided_in: i0022_engine_laws
adjudicated_by: user
statement: The battery runner gains progress, batch, and concurrency inside the guarded write path.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal at i22 M4
  adjudicated_by: grant-covered at i22 M4; the morning review confirms
---
## Rationale (not load-bearing)
The three battery requirements land inside the runner, behind the guarded write:
the progress line at the loop counter, the batch answer at the cache consult, the
concurrency as a bounded worker pool whose results flow through the SAME
verdict-write guard (one serialization point, no second write path). Concurrency
caps at the host's spare cores; order-independent tests only - the i13 lead chose
Go concurrency over test-thinning, and the flake risk is held at assertion level
(raid-guard-timing-flakes). Shapes elem-battery-shape and its leaves.
