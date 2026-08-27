---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-the-merge-cost-a-decision-accepts-is-a-cost-a-requirement-measures-as-zero
type: "[[raid]]"
kind: risk
breaks_how_badly: corrosive
how_likely: plausible
statement: One decision accepts a merge cost, and one requirement measures that same cost as zero, so the two disagree by design.
grade: corrosive
against:
  - req-two-hands-writing-work-at-once-do-not-collide
source_refs:
  - evaluate-architecture, the ATAM walk
  - raid-dec-the-position-owns-its-work-and-the-merge-cost-is-accepted
---

## The hinge

WHO OWNS THE FILE IS THE HINGE. The position owns its work, so two hands
working the same position from separate clones write the same file.

## The disagreement, stated plainly

THE DECISION SAYS the merge cost is accepted.

THE REQUIREMENT SAYS merges needing a person to resolve work content must be
zero.

BOTH ARE SIGNED AND BOTH ARE CURRENT. This is not a gap in the design; it is
two standing statements that cannot both hold.

## The tradeoff, named

WHAT IS BOUGHT: one readable file per position, editable by a person while the
record is open. That is what the owner asked for, and it is why the winner beat
the folded-while-open option.

WHAT IS PAID: a text merge a person may have to resolve, in the case where two
hands work one position at once.

## How likely the case is

NOT MEASURED. Nothing in this repository records how often two clones work the
same position, and no probe was run for it here.

SAYING SO IS THE HONEST ANSWER. A guessed frequency would let the disagreement
be dismissed on a number nobody produced.

## What has to happen

ONE OF THE TWO MUST MOVE, at the next milestone.

- THE REQUIREMENT relaxes its measure, with the reason recorded.
- OR THE DESIGN splits the file so two hands never write the same lines.
- OR THE FREQUENCY IS MEASURED and shown to be zero in practice, which settles
  it without either side moving.

## The trigger

IT FIRES AT THE BUILD, and at any point where a second hand is given the same
position.
