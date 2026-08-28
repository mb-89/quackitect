---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: req-absence-from-the-exemption-list-means-not-exempt
type: "[[requirement]]"
statement: The one-door mechanism shall treat a module absent from a rule's exemption list as not exempt from that rule.
kind: constraint
verify_method: test
breaks_if_removed: A reader who does not find a module on the list cannot tell whether it was considered and allowed or never looked at, which makes the whole list unreadable as an answer.
breaks_how_badly: crippling
refines:
  - uc-learn-why-a-module-departs-from-a-rule
  - uc-declare-an-exception-to-a-rule
source_refs:
  - stk-newcomer
priority: must
---

## Detail

THIS IS WHAT MAKES THE LIST ANSWERABLE. Without it the list says only what is
allowed, and a reader still has to read the code to learn what is forbidden.

THE READING PASS DEPENDS ON IT DIRECTLY. Step 5 of
uc-learn-why-a-module-departs-from-a-rule is a reader looking for a module,
not finding it, and concluding it is not exempt. That conclusion is only sound
because of this row.

THERE IS NO THIRD STATE. A module is governed and exempt, or governed and not
exempt. "Not yet considered" is not a value the mechanism carries, and adding
one would reintroduce the ambiguity this row removes.

WHAT THAT COSTS, SAID PLAINLY. Every module governed by a rule and not on its
list is in breach the moment the rule lands. That is why a rule ships with its
list already populated from the judgement pass, rather than empty.
