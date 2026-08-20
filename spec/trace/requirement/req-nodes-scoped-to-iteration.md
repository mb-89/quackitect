---
minted_in: i2
id: req-nodes-scoped-to-iteration
type: "[[requirement]]"
statement: The engine shall stamp every trace node with its minting iteration and default every reference view to the current iteration's nodes, with an opt-in toggle for the rest; the coverage laws keep reading the whole corpus.
kind: functional
verify_method: test
breaks_if_removed: Every form lists the whole corpus - 35 use cases where 1 is new - and the reader wades through history they never asked for.
breaks_how_badly: abrasive
refines:
  - uc-shape-the-view
source_refs:
  - uc-shape-the-view
priority: should
weighs_against:
  - req-walk-branches-at-waypoint >
---

## Detail

- The machinery stamps minted_in at creation; standing nodes backfill
  from the branch that first carried them, or i1 wholesale.
- The scoping is a VIEW concern, never a truth concern - a promise no
  story serves still fails globally.
