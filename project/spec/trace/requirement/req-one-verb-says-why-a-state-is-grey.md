---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: req-one-verb-says-why-a-state-is-grey
type: "[[requirement]]"
statement: When asked why a state is grey, the engine shall name every condition standing in the way of that state.
kind: functional
verify_method: test
breaks_if_removed: The question is answered by a cluster of shell probes, so the machine holds the verdict and the agent guesses at it. That is the shape the refusal law exists to stop.
breaks_how_badly: corrosive
refines:
  - uc-take-a-step
source_refs:
  - "note-936e7a2d67d5, the retro lead of 2026-08-11"
  - "guidance/refusals.md, the law that anything which blocks owes a remedy"
  - "project/spec/version-planning.md § i3, which says i3 absorbs the introspection-verb work"
priority: must
---

## Detail

- The answer names the CONDITIONS, not a colour. "Grey" is the symptom.
- Each condition comes back with what it wants, so the answer is actionable
  without a second question. That is the remedy test the refusal law sets.
- A state that is grey because its weight exceeds the dial says so, and says
  the weight and the dial.
- A state that is grey because an upstream state is unfilled names that state.

NO BEHAVIOUR MODEL HERE. The demand is one question and one answer. Nothing
is created, nothing changes state, and there is no order to draw. A diagram
would add a notation and no information.

## What it replaces

A cluster of shell probes. The retro's own mining step names that cluster as
the evidence for this verb, and killing it is how the verb pays for itself.
