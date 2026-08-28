---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: fn-govern-a-conversation-under-a-stated-rule.record-a-departure-with-its-reason
type: "[[function]]"
statement: record a departure from a rule together with the reason it was granted
satisfies:
  - req-an-exemption-without-a-reason-is-refused-at-write-time
inputs:
  - flow-a-departure-as-offered
outputs:
  - flow-the-recorded-departure
cluster: cluster-the-door-regime
source_refs:
  - uc-declare-an-exception-to-a-rule
  - uc-learn-why-a-module-departs-from-a-rule
---

## Rationale

The reason travels with the departure or it is lost. A reader six months on
asks why one module ignores a rule, and a departure list with no reasons
answers that somebody once wanted it to.

The prior-art comparison put a number on this. Of six systems surveyed in
`prior-art-one-door.md`, only one can force a reason at all, and only through
an opt-in third-party plugin. dependency-cruiser documents its own comment
field as "not used in any rule logic", so the author is shed on the way in.
