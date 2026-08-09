---
id: req-option-carries-cost-and-shed
type: "[[requirement]]"
statement: While any standing option lacks its cost entry or its shed entry, the engine shall keep the choosing step closed.
kind: functional
verify_method: test
breaks_if_removed: Options carry no price, so the choice is made against alternatives that were never real.
breaks_how_badly: corrosive
refines:
  - uc-diverge-before-deciding
source_refs:
  - uc-diverge-before-deciding step 4
  - uc-diverge-before-deciding guarantee
  - ".se/req-mine-v2.md: v2-023 Pugh shape"
priority: should
weighs_against:
  - req-losers-stay-on-record >
---

## Detail

## Detail

- Cost: what taking the option pays.
- Shed: what taking the option gives up.
- An absent entry and an empty entry close the step the same way.
