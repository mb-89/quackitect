---
kind: method
statement: "The gate template: how every gate is reviewed and blessed - the standard rounds evaluate the gate's specific acceptance items; specifics first, standard around them."
---

## Situation
Every gate state links this note. The gate's own evidence form carries its milestone-specific acceptance items; this template carries the standard review that evaluates them. The rounds themselves are [[meth-review-rounds]].

## The standard fields
- verify_round | built it right: each input state's evidence read against its claim - a bless is not proof | required
- validate_round | built the right thing: against the frame and vision, not just the plan; list what is missing, wrong, or out of scope | required
- redteam_round | the opposing case, rubric-cited; an override blesses past an unmet criterion and is logged WITH its dissent, never as a clean pass | required
- state_of_the_art | what was scanned for this milestone's artifact, what adopted, what rejected - or a recorded skip with reason ([[meth-state-of-the-art]]) | required
- verdict | pass, pass with noted overrides, or reopen with named states and reasons | required

## Procedure
- Work the specifics first: every acceptance item filled with real evidence.
- Then the rounds, in increasing scrutiny: verify, validate, red-team.
- Risk-weighted: deepest scrutiny on the most central, most-reversed, human-judged items. Scale to size - do not red-team a trivial gate.
- Killers (`killer` fields) are never self-certified by the agent that did the work.
- A reopen names states; the executor re-activates them and their downstream cone. Reopen edges are never drawn.
- The gate's bless is the adjudication act itself: hash-bound, channel-recorded. Where a milestone needs sign-off, the bless IS the sign-off.
