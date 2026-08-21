---
minted_in: i51
id: raid-dec-a-step-s-standing-is-one-word-from-a-closed-set-of-three
type: "[[raid]]"
kind: decision
statement: "A step's standing is one value from a closed set of three, so passed-and-also-deciding cannot be expressed and a reader that does not know the third word sees a word it does not recognise."
owner: the driving agent
trigger: the first reader that has to be told what the third word means, rather than failing loudly on meeting it
status: decided
how_likely: conceivable
breaks_how_badly: crippling
impact: "Every reader of a step's standing changes. Get the representation wrong and a gate opens on evidence that does not exist, which is the one failure this whole iteration must not introduce."
source_refs:
  - req-a-pending-verdict-is-recorded-against-its-state
  - raid-risk-a-hop-that-finishes-later-makes-green-ambiguous
  - opt-a-standing-is-one-closed-word
  - i51
---

## Why this and not the other

THE ALTERNATIVE WAS ON THE WINNER UNTIL THE GRAFT. `cand-the-account-that-follows-you`
took the standard's open state word, and its own seams admitted that an open
word lets a reader silently ignore a new value.

THE RE-SCORING AGENT CONFIRMED THAT ADMISSION DECIDED THE AXIS. The winner sat
at 2 on the fatal-graded row because of this cell alone, and rose to 3 when the
closed word replaced it.

TWO HEURISTICS POINT THE SAME WAY and neither was reached for on purpose. Make
the illegal unrepresentable rather than merely checked: a boolean plus a flag
needs a rule about legal combinations, and a rule needs a check, and a check can
be skipped. And the default should be the safe thing: a reader ignoring a flag
sees passed, where a reader meeting an unknown word sees an unknown word.

THE FAILURE MOVES FROM SILENT TO LOUD, and that is the whole argument.

## Rejected options

`opt-a-state-word-marks-what-is-listed-but-not-yet-usable` — Google AIP-151's
shape, where a resource with work running on it stays listed carrying a state
word saying it is not usable yet.

WHAT IT DOES BETTER, and it is real. An open word admits new values later
without every reader changing. A closed set of three does not, and widening it
is a change to everything that reads it.

WHY IT LOST. That is the same property as the failure: admitting new values
without readers changing is exactly what lets a reader silently ignore one. In
a system where the third value's whole purpose is to be noticed, the flexibility
is the defect.

AND OUR CONTEXT REMOVES ITS COST. The standard is written for generated clients
over a network, where an unknown enum value breaking a client is expensive. Our
readers are inside one process, so widening later is a compile error rather than
a broken deployment.

## Consequences

EVERY EXISTING READER OF A TWO-VALUE STANDING CHANGES. There is no way to add a
third value to a boolean without touching what reads it, and pretending
otherwise is what the flag design is for. That cost is why the iteration is
sized `major`.

THREE READERS ARE NAMED and each must state an answer: a gate asking whether its
feeders are green, the route drawer asking which hops already pass, and whatever
paints a step's standing.

THIS DECISION DOES NOT SAY WHAT EACH SHOULD DO with the third word. It says only
that the value reaches them distinctly rather than flattened, and that a reader
which has not been updated fails loudly.

WIDENING THE SET LATER IS A DECISION OF ITS OWN, and it supersedes this one
rather than extending it.
