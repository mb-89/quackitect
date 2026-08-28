---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: fn-govern-a-conversation-under-a-stated-rule.judge-each-governed-thing
type: "[[function]]"
statement: judge each governed thing against the rule that governs it
satisfies:
  - req-absence-from-the-exemption-list-means-not-exempt
  - req-no-setting-disables-every-rule-at-once
inputs:
  - flow-the-stated-rule
  - flow-the-governed-set
  - flow-the-recorded-departure
outputs:
  - flow-the-verdict-on-a-governed-thing
controls:
  - one verdict is owed for every member of the governed set
cluster: cluster-the-door-regime
source_refs:
  - uc-answer-every-export-with-a-door-or-a-deletion
---

## Rationale

The judging reads three things and writes one verdict per governed thing. It
is the step where the regime's two defaults live.

The first default is that a thing absent from the departure list is not
exempt. The alternative default — silence means permitted — turns a forgotten
entry into a granted exception.

The second is that no single setting turns every rule off. A regime with a
master switch is a regime that gets switched off once, under deadline, and
never back on.

Both are properties of the judging step rather than of the whole system,
because judging is where a default is actually applied.
