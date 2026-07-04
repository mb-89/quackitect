---
id: req-truth-in-spec
type: requirement
refines: [uc-repo-holds-only-truth]
statement: When a bless or a baseline re-record is written, the engine shall persist it under spec/ as committed truth.
depends_on: []
class: review
killer: false
---
## Rationale (not load-bearing)
attest.json and ears-baseline.json move to spec/ledger/; the iteration settings (type/rigor/version) become spec/project.toml.
