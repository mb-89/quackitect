---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: raid-r-the-archived-read-may-breach-the-one-second-rule
type: "[[raid]]"
kind: risk
statement: Reading an archived record from its own branch is slower than reading the live tree, and the one-second rule binds every surface a person touches.
owner: the adjudicator
trigger: the first measured read of an archived record from its branch
status: open
impact: the round's first goal is a surface a person opens, so a read that takes seconds delivers the feature and breaks the rule that made the surface worth having.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - draft-vision, the goal system's named conflict
  - req-responsiveness
---

THE CONFLICT IS ALREADY RULED, and this entry exists to hold the ruling to
account rather than to reopen it.

The record accepts a loading screen past a second for this one case. That is
the completeness side of the trade: a fast surface that cannot show a closed
record fails the goal the round exists to serve.

WHAT WOULD CHANGE THE RULING is a measurement showing the read is slow enough
that people stop opening archived records at all. At that point the trade has
bought nothing and the mechanism needs rethinking rather than accepting.
