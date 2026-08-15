---
minted_in: i3
id: req-red-objective-serves-its-fill
type: "[[requirement]]"
statement: If the route's objective is a state whose claim is red, then the engine shall serve that state's fill.
kind: functional
verify_method: test
breaks_if_removed: The walk stops at the state that needs work and says the target is where it already stands. The agent is told nothing is owed while a red claim blocks the route.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - "note-1f2cabfb9d0a, met live and recorded the same day"
  - "guidance/refusals.md, the law that anything which blocks owes a remedy"
priority: must
---

## Detail

- The message "the target is where the walk already stands" is correct about
  POSITION and useless about WORK. Both facts are true at once, and only one
  of them is actionable.
- A red claim AT the objective is the one case where standing still and being
  finished look identical from outside.
- Serving the fill is the remedy the refusals law already demands: anything
  that blocks owes an executable next act, not a diagnosis.

- WHAT STAYS UNCHANGED. A wait with no red objective still serves a wait.
  This row narrows one case; it does not make every wait serve a form.

NO BEHAVIOUR MODEL HERE, deliberately. The demand is one condition and one
response, with no order to show and nothing whose creation is in question. A
sequence diagram of it would restate the statement in a second notation.
