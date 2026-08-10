---
id: req-coverage-checked-both-ways
type: "[[requirement]]"
statement: While a field declares coverage over another type, the engine shall hold the state unmet until both directions hold with zero orphans on either side.
kind: functional
verify_method: test
verified_by:
  - "tests/trace-coverage.test.ts :: every requirement connects to at least one use-case"
  - "tests/trace-coverage.test.ts :: every use-case is refined by at least one requirement"
breaks_if_removed: A use case no requirement covers ships as covered; the trace lies where it matters most.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step ext 4b
  - ".se/req-mine-v2.md: spec discipline"
priority: must
---

## Detail

## Detail

- Direction one: every node of the declaring type names a live target.
- Direction two: every target of the covered type is named by at least one node.
- Coverage counts authored links only; a query-derived reference never counts.
