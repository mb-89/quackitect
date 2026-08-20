---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-carry-forward-attribution-covers-every-call-between-two-pulls
type: "[[raid]]"
kind: assumption
statement: "Every lane call between two se_pull answers belongs to the state the earlier pull named, so carrying that state forward attributes the whole log."
owner: the maintainer of the machine
trigger: the first benchmark run that derives cost per state
status: open
impact: "Cost lands on the wrong state wherever a call happened somewhere else. The ranked per-state view stops being trustworthy in exactly the places that are most expensive, which is where subagents and long tool runs live."
breaks_how_badly: corrosive
how_likely: plausible
probe: "unprobed — the rule was DESIGNED as the fix for exp-can-cost-per-state-be-derived-from-the-call-log, and the fix itself has never been run."
source_refs:
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Where it comes from

`exp-can-cost-per-state-be-derived-from-the-call-log` came back HALF FALSE. No
call record carries a state. Every `se_pull` carries its `where`, so the
boundaries are recoverable by inference.

THE CARRY-FORWARD RULE IS THAT INFERENCE. Walk the log in order. Each `se_pull`
answer names a state. Attribute every call after it to that state until the next
`se_pull` names a different one.

## Why it might not hold

A CALL BETWEEN TWO PULLS NEED NOT BE IN THE STATE THE PULL NAMED.

- A SUBAGENT'S CALLS interleave with the parent's and are attributed to whatever
  the parent last pulled.
- A `do` INSTRUCTION WALKS SEVERAL HOPS AT ONCE. The pull names where it landed,
  not every state it passed through, so the whole run of work collapses onto the
  landing state.
- AN ANSWER-SPILL READ is exempt from the state gate by design, so it can happen
  anywhere and is attributed to the state that happens to stand.

## Probe

Take one walk's own log. Attribute it by carry-forward, then attribute it by
hand from the same log's `where` fields and the evidence file timestamps.
Compare. The disagreement rate IS the error rate, and it is measurable on
material that already exists.

## What it costs if it bites

NOT THE TOTAL, WHICH STAYS RIGHT. The per-state ranking is the thing that
degrades, and the per-state ranking is what makes a benchmark actionable rather
than a single number.
