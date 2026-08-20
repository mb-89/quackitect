---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-iss-criteria-and-demands-were-judged-from-labels-not-statements
type: "[[raid]]"
kind: issue
statement: Requirements were judged by their ids and titles rather than by their statements, so three of eleven scoring axes measured the wrong thing and one demand was never checked at all.
owner: the driving agent
trigger: any state that hands a requirement to a scorer, a gate or a demand check by id
status: open
breaks_how_badly: crippling
how_likely: expected
impact: A criterion read from its title scores a property nobody asked for, and the arithmetic cannot see the substitution because every cell is filled and every id resolves. In i16 it produced a Pareto front that inverted when three of the eleven axes were read against their own text, and it let a must-priority demand pass unexamined through a whole milestone.
source_refs:
  - iterations/i16 evidence gate-candidates, round_0_verify and round_2_red_team
  - req-the-system-runs-in-a-tree-that-is-not-its-own
  - req-method-reuse-is-vendoring
  - req-divergence-order-on-record
  - req-upward-links-live-in-the-file
  - meth-scoring-anchors
---

## What happened

FOUR ARTIFACTS WERE JUDGED FROM THEIR NAMES. Each name is a good name. Each
means something narrower than it suggests.

- `req-divergence-order-on-record` reads "the order in which the problem, each
  option and the choice were entered". It is about whether somebody wrote the
  options down before picking one. All four cells scored overlay layer
  precedence.
- `req-upward-links-live-in-the-file` reads "every trace node's upward links in
  the node's own file". All four cells scored whether an override names its
  target.
- `req-method-reuse-is-vendoring` reads "the engine shall name the vendoring
  path and COPY ZERO METHOD FILES as part of the scaffold". Every cell rewarded
  the opposite, and the candidate that copies everything with no declared
  dependency scored highest on it.
- `req-the-system-runs-in-a-tree-that-is-not-its-own` is `priority: must` and
  demands resolution "from a RECORDED POINTER to the copy that created the
  tree". Three of four candidates pick self-location, which records nothing. The
  demand was never run against them.

## Why nothing caught it

EVERY MECHANICAL CHECK PASSED. The ids resolve. The table is complete. Each
candidate picks one option per question. The front computes. Nothing in the
corpus is malformed, so no refusal fires and no lint has anything to say.

THE SUBSTITUTION IS INVISIBLE TO ARITHMETIC because a wrong subject scored
carefully looks exactly like a right subject scored carefully.

AND THE NAMES ARE HONEST. Nobody wrote a misleading id. "Method reuse is
vendoring" is a fair summary of a rule that says reuse must be declared rather
than copied; it just does not carry the direction, and the direction is the
whole rule.

## The one that hurt most

THE VENDORING AXIS DECIDED THE ITERATION. Every failure to dominate by
`cand-everything-declared` ran through that one axis and no other. Scored
against the title it kept three candidates alive. Scored against the statement
it collapses the front.

AND IT SAT AT THE CUTOFF, the last row above the line. A criterion that is both
marginal and load-bearing is where a misreading does the most damage.

## What would have caught it

- THE SCORER RECEIVING STATEMENTS RATHER THAN IDS. It was handed eleven axis
  names and nothing else, which is the same shape as the missing prior-art list
  in [[raid-asm-one-scoring-pass-is-enough-to-eliminate]]. Both are the walking
  agent passing a label where the artifact was owed.
- A DEMAND CHECK THAT ENUMERATES. Nothing walked the `must` rows against the
  candidates. One sentence in cut-criteria asserted a demand failure that does
  not exist, and no mechanism contradicted it or found the one that does.

## What it is not

NOT A SCORER ERROR. Given a name and nothing else, mapping it into the
iteration's own domain is the only reasonable reading available. Every one of
these was a sound inference from what it was given.

NOT A NAMING PROBLEM. Renaming the requirements would trade one summary for
another. The fix is that a judgment reads the statement, never the handle.
