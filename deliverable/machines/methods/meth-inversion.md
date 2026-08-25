---
kind: method
statement: "When the walk is stuck, invert the question. Ask what would have to be true for the blocked thing to work, instead of asking again why it does not."
---

## Situation

Reach for this when the work has stopped and re-reading has not moved it.

THE SHAPE OF BEING STUCK. A constraint stands in the way. Everybody agrees it
stands. Every pass over the problem confirms it, and none of them moves.

THAT AGREEMENT IS THE SIGNAL. A constraint nobody challenges gets re-confirmed
by every check, because each check starts from it. The evidence is all there
and the wrong question is being asked of it.

## Form

Turn the question inside out. Three shapes, and the first is the cheapest.

- WHAT WOULD HAVE TO BE TRUE for this to work? Rather than: why does it not
  work.
- SUPPOSE IT ALREADY WORKS. What is it doing that we said was impossible?
- WHO SAID SO, AND IS IT A LAW OR AN IMPLEMENTATION? A law states an outcome
  that must hold. An implementation is one way of getting there, and it is
  usually stricter than the law it serves.

## Procedure

1. NAME THE CONSTRAINT IN ONE SENTENCE. If it takes a paragraph, it is two
   constraints and they should be separated first.
2. FIND WHERE IT IS WRITTEN DOWN. A standing demand, a design decision, a line
   of code, or nowhere at all. Nowhere is the most common answer and the most
   informative one.
3. ASK WHETHER THE WRITTEN THING SAYS WHAT PEOPLE THINK IT SAYS. Quote it.
   - A remembered constraint drifts stricter than the recorded one every time.
4. INVERT. Take one of the three shapes above and answer it honestly.
5. RULE ON WHAT COMES BACK. Either the constraint survives with its reason
   restated, or it was an implementation detail and the block is gone.

## Why this is a card rather than advice

A CONSTRAINT NOBODY CHALLENGES SURVIVES EVERY CHECK THE METHOD HAS. Measured
at i16, 2026-08-18: a design option was struck out on a constraint at the
option-enumeration step. That exclusion then stood through four more states
and a failed gate. Seven separate agent passes ran over it, including a red
team and a demand check, and both read the constraint as binding.

IT WAS NEVER A DEMAND. The standing law named the DIRECTION of writes. One
write target was an implementation of that law, stricter than the law itself,
and nobody had separated the two.

THE OWNER MOVED IT IN ONE MESSAGE, by asking how the product could possibly do
what it promises if the constraint were real. That is the inversion, and it is
a question the machine can ask itself.

## Neighbours

- [[meth-triz]] carries inversion as contradiction principle 13, inside a
  larger toolkit for a different job.
- [[meth-scamper]] carries it as the letter R, for reverse.

NEITHER IS REACHABLE WHEN THE WALK IS STUCK SOMEWHERE ELSE, and that is the
gap this card fills. Both are aids for generating options. This one is for
when there are no options because something is blocking.

## Sources

THE EXTERNAL PRIOR ART IS NOT SWEPT, and this section says so rather than
leaving a blank. Published techniques in this family exist and none has been
read for this card. What stands below the line is the local case only.

- The i16 path-jail exclusion, 2026-08-18. The owner's ruling that produced
  this card.
