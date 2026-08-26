---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: fn-govern-a-conversation-under-a-stated-rule.state-a-rule-once
type: "[[function]]"
statement: express one rule in one place
satisfies:
  - req-one-rule-is-expressed-once-and-read-by-two-callers
  - req-a-door-is-named-for-the-conversation-it-governs
inputs:
  - flow-a-rule-as-authored
outputs:
  - flow-the-stated-rule
cluster: cluster-the-door-regime
source_refs:
  - uc-declare-an-exception-to-a-rule
---

## Rationale

Two callers read every rule here: the guard that refuses a write, and the
sweep that reports what already stands. A rule written twice drifts, and the
two callers then disagree about what is legal.

It stands as its own function because the expression is a separate act from
the judging. M4 can allocate the expression to a file the maintainer edits
and the judging to code, and neither choice constrains the other.
