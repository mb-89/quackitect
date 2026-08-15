---
minted_in: i12
id: raid-asm-waiting-makes-a-person-look-less
type: "[[raid]]"
kind: assumption
statement: A person who waits several seconds per look opens fewer artifacts, and adjudicates from less than they would have read.
owner: the adjudicator
trigger: the surfaces answer inside a second and the number of artifacts opened per gate does not rise
status: open
probed: "2026-08-15"
probe: "unprobed - nothing counts artifacts opened per adjudication. The count is derivable from the call log, and building it is not this iteration's work."
impact: This is the cost the record is really buying down. If it is false, the work buys comfort rather than judgment quality, and the value prop's claim about where a person's time goes is overstated.
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - vp-rigor-without-toil
  - sty-judge-without-waiting
  - req-surface-answers-in-one-second
---

## Why it is written down

The record's story ends on this claim, and it is the one slide nothing
measures. Everything before it is recorded in milliseconds.

An assumption that carries a record's whole justification and never gets
stated is the worst kind, because every later argument leans on it
silently.

## Why it is not a requirement

It is a claim about PEOPLE, not about the system. No EARS shape fits it
and no verify_method would catch it failing.

The system-side demand is already written as
req-surface-answers-in-one-second, and that row can be tested. This entry
is why that row is worth having.

## Why it is plausible rather than established

It is ordinary interaction-cost reasoning and it is not measured here.
Nothing in this project counts how many artifacts an adjudication opens,
so the claim rests on argument rather than on evidence.

Recording it as an assumption is the honest treatment. Asserting it in a
value prop as though it were measured would be the dishonest one.

## Probe

Count artifacts opened per gate adjudication, before and after the
surfaces come inside the bound.

The count is derivable from the call log, which already records every
read. Nothing computes it today, and building that counter is the probe.

A count that does not rise means the waiting was not what limited the
looking, and the value prop's criterion wants rewording rather than the
work being undone.
