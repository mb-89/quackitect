---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-the-capability-is-handed-to-a-module-rather-than-imported-by-it
type: "[[option]]"
statement: A module receives the capability it may use as an argument, so a module nobody handed it cannot reach it at all and no check is needed to say so.
cluster: cluster-the-door-regime
found_by: heuristic
source: the heuristics catalogue — make the illegal unrepresentable, not merely checked
---

## Mechanism

One module reaches the capability. Every other module takes what it needs as a
parameter, from whoever composed it.

A module that was not handed the capability has no way to reach it. There is
no rule to break, so there is nothing to check, nothing to exempt and nothing
to sweep.

WHY IT IS DIFFERENT IN KIND FROM EVERYTHING ELSE ON THIS CHART. Every other
option governs a rule. This one removes the rule by making the violation
impossible to write.

IT ALSO CHANGES WHAT THE OTHER FUNCTIONS ARE FOR. Enumerating what a rule
governs becomes enumerating what was handed to whom, which is a composition
question with an exact answer rather than a search.

WHAT IT COSTS, AND THE COST IS THE WHOLE ARGUMENT. It is the largest change on
the chart by a wide margin. 79 modules reach the filesystem directly today, and
every one of them would need its callers changed too, all the way up to
whatever composes them. Nothing part-way is coherent: a module that takes the
capability as an argument AND can still import it directly has bought the cost
and none of the guarantee.

SO IT IS ALL OR NOTHING, and the record's own frozen-count option exists
because all-at-once is what 79 modules cannot do.

WHAT SAVES IT FROM BEING A STRAW MAN. It could apply to ONE conversation rather
than to all of them. The version door has few callers and no history, so it
could be handed rather than imported from the first day, and the byte door
could keep the rule-and-departure shape.

THAT MIXED READING IS THE INTERESTING ONE, and no other finder produced it.
