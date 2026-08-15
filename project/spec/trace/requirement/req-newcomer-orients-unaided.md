---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-newcomer-orients-unaided
type: "[[requirement]]"
statement: When a first-time reader opens the entry documents unaided, the entry documents shall bring at least 2 of 3 such readers to state what the product is within one session.
kind: quality
verify_method: demonstration
breaks_if_removed: Nobody measures orientation, and the entry documents rot unnoticed until the next cold read fails.
breaks_how_badly: abrasive
refines:
  - uc-quality-interaction-capability
source_refs:
  - uc-quality-interaction-capability step 5
  - stk-newcomer
  - meth-requirement-authoring — population measure form
  - i19 cold read
priority: could
weighs_against:
  - req-newcomer-one-command > — entry documents rotting unnoticed outlasts one install path's step count
---

## Scenario

- source: a first-time reader
- stimulus: they meet the project with no context
- artifact: the entry documents and the entry chain
- environment: alone, one session, no help channel
- response: the reader orients: what the product is, where work happens
- response measure: at least 2 of 3 first-time readers state what the product is within one session, unaided (population measure; the cold-read protocol is the instrument)
