---
id: req-size-proposal-names-strikes
type: "[[requirement]]"
statement: When a change size is proposed for an iteration, the product shall present the proposal with its reasoning and the cells each smaller column strikes.
kind: functional
verify_method: test
breaks_if_removed: The person blesses a size blind; struck cells surface only after the walk.
breaks_how_badly: crippling
refines:
  - uc-open-an-iteration
source_refs:
  - uc-open-an-iteration step 4
  - uc-open-an-iteration ext 4a
priority: must
---

## Detail

## Detail

| case | proposal |
| --- | --- |
| a standing baseline exists | the size the reasoning supports, with the struck cells of each smaller column listed |
| no standing baseline (first iteration) | `product` — the vision, the stakeholders and the baseline are all unauthored |

The struck-cell list names concrete cells, never a count alone.
