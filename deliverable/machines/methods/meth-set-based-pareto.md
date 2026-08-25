---
kind: method
statement: "Set-based design with a Pareto front: keep the non-dominated set alive, eliminate dominated candidates with recorded reasons, converge at the last responsible moment."
---

## Situation

M4's evaluate-set and its gate: the candidates gate blesses the FRONT, never a
winner. Convergence to one happens at M5 — controlled, not premature.

## Procedure

- Score every composed candidate on the weighted criteria AND the structure
  metrics from its matrices — multi-objective, no early collapsing into one
  number.
- A candidate is dominated when another is at least as good on every objective
  and better on one. Eliminate dominated candidates — each elimination
  recorded with its reason (they are history, not embarrassments).
- The survivors are the Pareto front. Keep them ALL alive into M5; narrowing
  before the evidence exists is the failure mode this method prevents.
- All-options-equal is a signal with two readings: the decision does not
  matter, or a discriminating criterion is missing. Ask which, out loud.

## NOBODY WORKS OUT THE FRONT BY HAND

Domination is the one-line rule above, so the front and every elimination are
a FUNCTION of the score table. The person scores; the arithmetic does the
rest.

This matters more than it sounds. A typed front can
be wrong with nothing checking it, and worse, it can DISAGREE with the scores
sitting in the same form. What the person owes is the judgment arithmetic
cannot make: whether an elimination is accepted, and anything the numbers do
not capture.

## THE TWO CORNERS

The front is a curve, and a curve is hard to read without something to read it
against. Two constructed points bound the region the decision actually lives
in. Neither is a candidate; both are drawn.

- THE UTOPIA POINT — the best value ANY candidate achieves on each axis,
  assembled into one vector. Usually nothing is there, because the best on
  speed and the best on cost are rarely the same design. It is the corner the
  front bends toward.
- THE NADIR POINT — the WORST value on each axis AMONG THE FRONT. Not among
  all candidates: taking it over the whole set makes it the worst of the
  losers, which says nothing about the decision.

### What they are for

- DISTANCE TO UTOPIA RANKS THE FRONT WITHOUT PICKING FROM IT. The front is
  unordered by construction, and that is correct — but "which survivors are
  close to ideal" is a reading, not a decision, and the gate can have it.
- THE GAP IS ITSELF A FINDING. A front far from utopia on every axis says no
  candidate is good anywhere. That is a result about the OPTION SPACE, not
  about the candidates, and it sends the work back to enumerate-space rather
  than forward to a choice.
- THE BOX BETWEEN THEM IS HOW MUCH THE DECISION IS WORTH. A narrow box means
  the survivors barely differ, which is the all-options-equal signal arriving
  as a number instead of an impression.

### The one thing they must not become

A DISTANCE IS NOT A WINNER. Collapsing the front to whichever point sits
nearest utopia is exactly the early collapse into one number this method
exists to prevent, wearing a geometric disguise. The gate blesses the front.

## Sources

- Toyota set-based concurrent engineering; design-space exploration.
- The utopia and nadir points are standard multi-objective optimization
  vocabulary — the ideal point of per-objective optima, and the worst values
  over the Pareto set. PRIMARY NOT SEEN: the SyA corpus at @ai/sya_kb was not
  reachable when this was written (the search timed out), so this is the
  general definition rather than a citation to our own reference shelf. Worth
  re-checking against the corpus and citing properly.
