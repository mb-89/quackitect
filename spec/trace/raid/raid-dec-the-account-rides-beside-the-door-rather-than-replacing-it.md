---
minted_in: i51
id: raid-dec-the-account-rides-beside-the-door-rather-than-replacing-it
type: "[[raid]]"
kind: decision
statement: "The caller learns about work out of sight two ways at once: one door it can ask, and a small rider on every answer that tells it what changed — and the rider never replaces the door."
owner: the driving agent
trigger: the first completion a caller misses because it relied on a rider that had nothing to say
status: decided
how_likely: plausible
breaks_how_badly: crippling
impact: "An absent rider is indistinguishable from a rider that was never emitted. A caller relying on the rider alone can miss a completion inside an answer that reported success, which is the forbidden shape of the fatal-graded axis."
source_refs:
  - req-one-call-reports-every-piece-of-work-out-of-sight
  - opt-the-account-rides-every-answer
  - opt-one-operation-object-serves-every-kind-of-long-work
  - i51
---

## Why this and not the other

TWO MECHANISMS RATHER THAN ONE, and the chart got this wrong before the graft
fixed it.

THE DOOR IS THE STANDARD'S SHAPE. Google AIP-151 says every method that may run
long returns the same operation object, and that individual APIs must not define
their own interfaces for long-running operations, to avoid non-uniformity. Our
two job tables are exactly what that rule forbids.

THE RIDER IS OURS AND IT IS WHERE THE 5 CAME FROM. AIP-151's operation object is
observed only by the caller coming back to poll. GitHub Actions publishes
execution time after the fact and never during. A rider that delivers completion
inside an answer the caller was getting anyway beats both named comparisons.

WHY BOTH. The chart's telling row made them alternatives, and they are not. The
rider option names the door in its own body as the thing it rides beside, and
says the two answer different questions: what is running, and did anything
change.

THE WINNER LEANED ON A DOOR IT HAD NOT PICKED until the graft, and a re-scoring
agent found it. That is the evidence this is one decision rather than two.

## Rejected options

`opt-the-answer-names-when-to-ask-again` — the next-ask time.

WHAT IT DOES BETTER, and it is the one thing this decision does not cover: it
gives a caller something to act on when no estimate can be given at all.

WHY IT LOST. The rider already delivers what it was for. A caller that learns of
completion inside an answer it was getting anyway does not need telling when to
come back. The remaining case, a job with nothing to count, is covered by the
basis field saying so.

WHAT WOULD BRING IT BACK: evidence that callers idle for long stretches without
making any lane call, so no answer exists for a rider to ride on.

KEEPING ONLY THE DOOR was never a candidate, and the trimming finder asked. Each
kind of work keeps its own door, the caller learns two doors, and the refusal
for an unknown test job keeps pointing at a list that cannot hold it. That
failure is already in the code today.

## Consequences

THE RIDER IS BOUND BY THREE RULES and none of them is a mechanism. It appears
only when there is something to say. It carries a count and a change, never the
account. It never grows with the work.

THAT IS DISCIPLINE RATHER THAN CONSTRUCTION, and it is this decision's weakest
point. This product moved big results to disk and pages them back by reference
precisely because answers grew. A rider proportional to the work is that problem
returning through a door nobody was watching.

AND THE FIRST RULE CREATES THE HOLE THIS DECISION IS GRADED ON. A rider that
appears only when there is something to say is absent when there is nothing —
and absent is indistinguishable from never emitted. THE DOOR IS WHAT CLOSES
THAT: a caller that must be certain asks, and asking always answers.

SO THE DOOR IS NOT A CONVENIENCE. It is the guarantee, and the rider is the
optimisation. A design that drops the door has kept the fast path and lost the
correct one.
