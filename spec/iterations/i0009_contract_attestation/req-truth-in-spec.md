---
id: req-truth-in-spec
type: requirement
statement: When a bless or a baseline re-record is written, the engine shall persist it under spec/ as committed truth.
depends_on: []
class: review
killer: false
phase: [engineering]
discipline: [software]
quality: [reliability]
---
## Rationale (not load-bearing)
attest.json and ears-baseline.json move to spec/ledger/; the iteration settings (type/rigor/version) become spec/project.toml.
