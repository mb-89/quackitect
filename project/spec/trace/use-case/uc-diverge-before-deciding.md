---
id: uc-diverge-before-deciding
type: "[[use-case]]"
statement: Produce several real options for a problem before any of them is chosen.
actor: stk-engineer-driving-agents
trigger: a problem has an obvious answer and nobody has checked whether it is the best one
precondition: none
guarantee: more than one option stands, each with what it costs and what it sheds, and the choice is recorded against the alternatives
refines:
  - sty-diverge-on-purpose
killer: false
---

## Main scenario

1. The person enters ideation, which opens no record and commits nothing.
2. They state the problem rather than the answer.
3. Options are generated — more than one, and the obvious one does not count as the second.
4. Each option gets what it costs and what it gives up.
5. One is chosen, with the reasoning against the others written beside it.
6. The losers stay on the record so they are not re-proposed as new ideas later.

## Extensions

- 1a. Ideation is entered with a decision already made. That is not divergence; the state is being used to ratify, and the options generated after a decision are decoration.
- 3a. Only one option can be found. That is a finding — either the problem is over-constrained, or the constraints were assumed rather than checked.
- 5a. No option is good enough. Choosing none is a legal outcome, and the record says what would have to change.
- 6a. The choice needs a record to live in. Ideation does not seed one; that goes back to the desk, which is where vehicles are judged.
