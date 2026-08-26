---
minted_in: i1
id: tsp-hand-walk
type: "[[test-spec]]"
statement: A person at the autonomy bank's bottom rung drives every step themselves - the machine advances on their acts alone and never walks ahead of them, verified by demonstration at the live panel.
method: demonstration
verifies:
  - none — demonstrates sty-walk-it-by-hand carries the edge; the mechanics are test-verified by tsp-walk-discipline
demonstrates:
  - sty-walk-it-by-hand
files:
  - none — the procedure below is the definition; the observed session is the evidence
---

## Scope

The mechanics are test-verified by [[tsp-walk-discipline]]
(req-autonomy-gates-every-hop); THIS spec demonstrates the story end to
end, and `demonstrates:` is its upward edge.

The manual drive: the autonomy bank at its bottom rung, a person clicking
through states the agent would otherwise enter alone. The claim is the
dial's floor - at `blocked` even mechanical steps wait for the person.

THE CONTROL IS A RUNG BANK, NOT A SLIDER (machines/panels/controls.md).
This spec said slider in three places until i33's verification caught it;
i6 had already struck the same wording from three engine comments.

## Approach

System level, at the live panel, driven by a person. The agent observes
and records; it must not advance anything.

## Procedure

- Set the autonomy bank to its bottom rung with a walk standing.
  Observe: the walk stops asking the agent forward; the next step waits.
- The person enters the waiting state from the panel. Observe: the walk
  advances exactly one state, on their act alone.
- The person works a form and submits. Observe: the signature carries
  their hand, not the agent's.
- Leave the bank at its bottom rung across an agent pull. Observe: the
  pull reports the waiting step and stops; nothing moves.
