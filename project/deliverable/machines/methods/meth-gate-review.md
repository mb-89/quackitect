---
kind: method
statement: "The gate template: how every gate is reviewed and blessed - the standard rounds evaluate the gate's specific acceptance items; specifics first, standard around them."
---

## Situation
Every gate state links this note. The gate's own evidence form carries its milestone-specific acceptance items; this template carries the standard review that evaluates them. The rounds themselves are [[meth-review-rounds]].

THE EVIDENCE FORM IS THE REVIEW (owner ruling 2026-08-06). There is no second review artifact. The form holds the acceptance items, the rounds and the verdict, and the bless on it is the gate's ruling.

The engine demanded a separate milestone-review file until that ruling. None was ever written, for any gate, in any iteration. It asked for the same sections under a second path, which is the DRY law broken inside the gate itself.

## The standard fields
- round_0_verify | built it right: one line per check that ran, each with its verdict - a bless is not proof | required
- round_1_validate | built the right thing: against the frame and vision, not just the plan; list what is missing, wrong, or out of scope | required
- round_2_red_team | the opposing case: one finding per line, each answered; the kill-criterion named and looked for | required
- state_of_the_art | what was scanned for this milestone's artifact, what adopted, what rejected - or a recorded skip with reason ([[meth-state-of-the-art]]) | required
- verdict | pass, pass with noted overrides, or reopen with named states and reasons | required

## Procedure
- Work the specifics first: every acceptance item filled with real evidence.
- Then the rounds, in increasing scrutiny: verify, validate, red-team.
- Risk-weighted: deepest scrutiny on the most central, most-reversed, human-judged items. Scale to size - do not red-team a trivial gate.
- Killers (`killer` fields) are never self-certified by the agent that did the work.
- A reopen names states; the executor re-activates them and their downstream cone. Reopen edges are never drawn.
- The gate's bless is the adjudication act itself, recorded with the hand that made it. Where a milestone needs sign-off, the bless IS the sign-off.
- A bless does not outlive its evidence. When an input under the claim moves, the sign-off and the bless come off and a `suspect:` line goes on, naming what moved.
- A gate refuses while any FEEDER state is unsigned. The review covers the input cone, so the cone must stand before the gate can be judged.
