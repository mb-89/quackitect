---
id: adr-guard-dispatch-layer
type: adr
decided_in: i0022_engine_laws
adjudicated_by: user
statement: Command guards live in ONE dispatch-layer pass, never per handler.
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
The Pugh run (M4-decision.md) chose the dispatch layer over per-command guards
(the datum, today's de-facto pattern) and over a config-interpreted policy. The
deciding criteria: coverage uniformity (a new command is guarded by default) and
trust (one tested predicate set, no wording drift). Tripwire, recorded: a rule
table past ten per-command entries means the layer has become per-command logic
in disguise - revisit. Shapes elem-command-guards in model-guard-tree.
