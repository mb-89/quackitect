---
id: adr-verdict-write-guard
type: adr
decided_in: i0022_engine_laws
adjudicated_by: user
statement: Battery trust guards wrap the single verdict-write path.
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
The busy-no-record and first-green guards wrap the ONE function that writes a
verdict into the cache. The rejected alternative - per-test self-checks - is the
documented i21 failure mode (raid-busy-record): the deck-goto test guarded itself
and still poisoned the cache. A guard at the write point cannot be forgotten by
the next test author. Shapes go-verdict-guard in model-guard-tree.
