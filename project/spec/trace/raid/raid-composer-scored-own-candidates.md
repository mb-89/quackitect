---
id: raid-composer-scored-own-candidates
type: "[[raid]]"
kind: issue
statement: The five candidates were composed and scored by the same agent, against the evaluate-set rule that a research agent scores, never the builder.
owner: the adjudicator
trigger: any re-score by a second hand
status: open
impact: The 95 standing scores may carry composer bias, and that bias leaves no trace in the numbers. M5 must not converge on them until a second hand re-scores.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - iterations/i1 evidence gate-candidates, round_0_verify and verdict
  - M4_30_evaluate-set scores guidance
---

It already happened, so it is an issue, not a risk. The 2026-08-09 sitting
composed the candidates at run-candidates and then scored them at
evaluate-set with the same hands.

WHY THE RULE FAILED. It stood as one prose line with no mechanism: nothing
spawned a second agent, and no check refuses a composer-authored table.

THE REPAIR STANDS IN THE METHOD since 2026-08-10: the evaluate-set row now
requires the score table to be filled by a spawned clean-context subagent.

THE DEBT STANDS UNTIL a full second-hand re-score runs under that rule.
The trigger above closes this entry.
